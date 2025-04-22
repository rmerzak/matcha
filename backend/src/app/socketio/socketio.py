import logging
import socketio
from fastapi import Depends
from app.schemas.users import User
from app.core.dependencies import get_current_user_info
from app.core.middleware import inject
from app.core.container import Container
from app.services.socketio_manager_interface import ISocketIOManager
from app.services.implementation.likes_interface_imp import LikesServiceImp
from app.services.implementation.blocks_interface_imp import BlocksServiceImp
from app.services.implementation.message_interface_imp import MessageServiceImp
from app.services.message_interface import IMessageService
from dependency_injector.wiring import Provide
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Initialize Socket.IO server with CORS and other configurations
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=["*"],
    # logger=True,
    # engineio_logger=True
)

@sio.event
async def connect_error(sid, data):
    """Handle connection errors"""
    logger.error(f"Connection error for SID {sid}: {data}")
    await sio.emit('error', {'message': 'Connection error occurred'}, room=sid)

@sio.event
async def error_handler(sid, data):
    """Handle general errors"""
    logger.error(f"Error for SID {sid}: {data}")
    await sio.emit('error', {'message': 'An error occurred'}, room=sid)

@sio.event
@inject
async def connect(
    sid: str, 
    environ: dict,
    socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager])
) -> bool:
    """Handle new connections"""
    try:
        user = await socketio_manager.authenticate_connection(sid, environ)
        if not user:
            logger.warning(f"Authentication failed for socket {sid}")
            await socketio_manager.send_error("Authentication failed", sid)
            return False
        user_sid = socketio_manager.get_user_uid_to_sid()
        logger.info(f"User sid: {user_sid}")
        user = socketio_manager.get_user_uid_to_sid()
        logger.info(f"User *****: {user}")
        # await socketio_manager.connect_socket(sid, user)
        return True
    except Exception as e:
        logger.error(f"Error during connection for SID {sid}: {str(e)}")
        await socketio_manager.send_error("Connection failed", sid)
        return False

@sio.event
@inject
async def disconnect(sid: str, 
                    socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager])):
    """Handle disconnections"""
    try:
        user = socketio_manager.get_user_for_sid(sid)
        await socketio_manager.disconnect_socket(sid)
        if user:
            logger.info(f"User {user['username']} disconnected - SID: {sid}")
        else:
            logger.info(f"Unknown user disconnected - SID: {sid}")
    except Exception as e:
        logger.error(f"Error during disconnection for SID {sid}: {str(e)}")
    finally:
        await socketio_manager.close_scoped_session()

@sio.on('send_message')
@inject
async def handle_message(
    sid: str,
    data: Dict,
    socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager]),
    message_service: IMessageService = Depends(Provide[Container.message_service]),
    likes_service: LikesServiceImp = Depends(Provide[Container.likes_service]),
    blocks_service: BlocksServiceImp = Depends(Provide[Container.blocks_service])
) -> None:
    """
    Handle real-time message sending
    """
    try:
        # logger.info("handle_message",data)
        # Get sender from socket connection
        sender = socketio_manager.get_user_for_sid(sid)
        if not sender:
            await socketio_manager.send_error("Not authenticated", sid)
            return

        receiver_id = data.get('receiver_id')
        content = data.get('content')
        logger.info(f"sender: {sender}")
        logger.info(f"receiver_id: {receiver_id}")
        logger.info(f"content: {content}")
        
        if not receiver_id or not content:
            await socketio_manager.send_error("Invalid message data", sid)
            return

        # # Check for blocks
        try:
            block_status = await blocks_service.check_block(sender['id'], receiver_id)
            logger.info(f"block_status: {block_status}")
            
            if block_status.get('is_blocked', False):
                if block_status.get('user_blocked_me', False):
                    await socketio_manager.send_error("Cannot send message - user has blocked you", sid)
                else:
                    await socketio_manager.send_error("Cannot send message - you have blocked this user", sid)
                return
        except Exception as e:
            logger.error(f"Error checking block status: {str(e)}")
            await socketio_manager.send_error("Error checking block status", sid)
            return
        # # Check if users are connected (mutual likes)
        try:
            like_status = await likes_service.get_like_status(sender['id'], receiver_id)
            logger.info(f"like_status: {like_status}")
            if not like_status.get("is_connected", False):
                await socketio_manager.send_error("Cannot send message - users are not connected", sid)
                return
        except Exception as e:
            logger.error(f"Error checking like status: {str(e)}")
            await socketio_manager.send_error("Error checking like status", sid)
            return

        # # Send the message
        # result = await message_service.send_message(
        #     sender_id=sender['id'],
        #     receiver_id=receiver_id,
        #     content=content
        # )

        # if result.get("status_code", 500) != 200:
        #     await socketio_manager.send_error(result.get("message", "Failed to send message"), sid)
        #     return

        # # Emit to receiver if online
        # receiver_sid = socketio_manager.get_user_sid(receiver_id)
        # if receiver_sid:
        #     await sio.emit('new_message', {
        #         'message_id': result['data']['id'],
        #         'sender_id': sender['id'],
        #         'sender_name': sender.get('username'),
        #         'content': content,
        #         'sent_at': result['data']['sent_at']
        #     }, room=receiver_sid)

        # # Confirm to sender
        # await sio.emit('message_sent', {
        #     'success': True,
        #     'message_id': result['data']['id']
        # }, room=sid)

    except Exception as e:
        logger.error(f"Error handling message - SID {sid}: {str(e)}")
        await socketio_manager.send_error("Failed to process message", sid)

@sio.on('join_chat')
@inject
async def join_chat(
    sid: str,
    data: Dict,
    socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager]),
    likes_service: LikesServiceImp = Depends(Provide[Container.likes_service]),
    blocks_service: BlocksServiceImp = Depends(Provide[Container.blocks_service])
) -> None:
    """
    Handle user joining a chat room
    """
    try:
        user = socketio_manager.get_user_for_sid(sid)
        if not user:
            await socketio_manager.send_error("Not authenticated", sid)
            return

        other_user_id = data.get('other_user_id')
        if not other_user_id:
            await socketio_manager.send_error("Invalid chat join request", sid)
            return

        # Check for blocks
        block_status = await blocks_service.check_block(user['id'], other_user_id)
        if block_status.get("data", {}).get("is_blocked", False):
            await socketio_manager.send_error("Cannot join chat - blocking in effect", sid)
            return

        # Check if users are connected
        like_status = await likes_service.get_like_status(user['id'], other_user_id)
        if not like_status.get("data", {}).get("is_connected", False):
            await socketio_manager.send_error("Cannot join chat - users are not connected", sid)
            return

        # Create a unique room name for these two users
        room_name = f"chat_{min(user['id'], other_user_id)}_{max(user['id'], other_user_id)}"
        
        # Join the room
        sio.enter_room(sid, room_name)
        
        await sio.emit('chat_joined', {
            'room': room_name,
            'other_user_id': other_user_id
        }, room=sid)

    except Exception as e:
        logger.error(f"Error joining chat - SID {sid}: {str(e)}")
        await socketio_manager.send_error("Failed to join chat", sid)

@sio.on('leave_chat')
async def leave_chat(sid: str, data: Dict) -> None:
    """
    Handle user leaving a chat room
    """
    try:
        room_name = data.get('room')
        if room_name:
            sio.leave_room(sid, room_name)
            await sio.emit('chat_left', {'room': room_name}, room=sid)
    except Exception as e:
        logger.error(f"Error leaving chat - SID {sid}: {str(e)}")