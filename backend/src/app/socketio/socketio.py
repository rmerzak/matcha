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
from app.services.notification_interface import INotificationService
from dependency_injector.wiring import Provide
from typing import Dict, Optional
import logging
logger = logging.getLogger(__name__)
 

# Initialize Socket.IO server with CORS and other configurations
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[],
    # logger=True,
    # engineio_logger=True
    
)

@sio.event
async def connect_error(sid, data):
    """Handle connection errors"""
    await sio.emit('error', {'message': 'Connection error occurred'}, room=sid)

@sio.event
async def error_handler(sid, data):
    """Handle general errors"""
    logger.error(f"Error for SID {sid}: {data}")
    await sio.emit('error', {'message': 'An error occurred'}, room=sid)

@sio.event
async def connect(
    sid: str, 
    environ: dict,
    auth: dict,
) -> bool:
    """Handle new connections"""
    try:
        from app.main import container
        socketio_manager = container.socketio_manager()
        logger.info(f"Auth: {auth['token']}")
        logger.info(f"Sid: {sid}")
        user = await socketio_manager.authenticate_connection(sid, auth['token'])
        if not user:
            logger.warning(f"Authentication failed for socket {sid}")
            await socketio_manager.send_error("Authentication failed", sid)
            return False
        user_sid = socketio_manager.get_user_uid_to_sid()
        logger.info(f"User sid: {user_sid}")
        user = socketio_manager.get_user_uid_to_sid()
        logger.info(f"User *****: {user}")
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

@sio.on('send_message')
@inject
async def handle_message(
    sid: str,
    data: Dict,
    socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager]),
    message_service: IMessageService = Depends(Provide[Container.message_service]),
    likes_service: LikesServiceImp = Depends(Provide[Container.likes_service]),
    blocks_service: BlocksServiceImp = Depends(Provide[Container.blocks_service]),
    notification_service: INotificationService = Depends(Provide[Container.notification_service])
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
        # logger.info(f"sender: {sender}")
        # logger.info(f"receiver_id: {receiver_id}")
        # logger.info(f"content: {content}")
        
        if not receiver_id or not content:
            await socketio_manager.send_error("Invalid message data", sid)
            return

        # # Check for blocks
        try:
            block_status = await blocks_service.check_block(sender['id'], receiver_id)
            
            if block_status.get('is_blocked', False):
                if block_status.get('user_blocked_me', False):
                    await socketio_manager.send_error("Cannot send message - user has blocked you", sid)
                else:
                    await socketio_manager.send_error("Cannot send message - you have blocked this user", sid)
                return
        except Exception as e:
            await socketio_manager.send_error("Error checking block status", sid)
            return
        try:
            like_status = await likes_service.get_like_status(sender['id'], receiver_id)
            if not like_status.get("is_connected", False):
                await socketio_manager.send_error("Cannot send message - users are not connected", sid)
                return
        except Exception as e:
            # logger.error(f"Error checking like status: {str(e)}")
            await socketio_manager.send_error("Error checking like status", sid)
            return
        # logger.info(f"sender: {sender}")
        # # Send the message
        result = await message_service.create_message(
            sender_id=sender['id'],
            receiver_id=receiver_id,
            content=content
        )
        if result is None:
            await socketio_manager.send_error("Failed to send message", sid)
            return
        # logger.info(f"result: {result}")
        # serializable_result = {
        #     'id': str(result['id']),
        #     'sender_id': str(result['sender']),
        #     'user_id': str(result['receiver']),
        #     'content': result['content'],
        #     'username': result['sender_username'],
        #     'profile_picture': result['sender_profile_picture'],
        #     'type': 'message',
        #     'is_read': result['is_read'],
        #     'created_at': result['sent_at'].isoformat() if result['sent_at'] else None
        # }
        notification_data = await notification_service.send_message_notification(result, receiver_id)
        # notification_data = {
        #     "event": "new_message",
        #     "data": {
        #         "id": str(result['id']),
        #         "type": "message",
        #         "content": result['content'],
        #         "sender": {
        #             "id": str(result['sender']),
        #             "username": result['sender_username'],
        #             "profile_picture": result['sender_profile_picture']
        #         },
        #         "created_at": result['sent_at'].isoformat() if result['sent_at'] else None
        #     }
        # }
        # await socketio_manager.send_event("new_message", serializable_result, user_id=receiver_id)
        await socketio_manager.send_event("new_message", notification_data, user_id=receiver_id)
    except Exception as e:
        await socketio_manager.send_error("Failed to process message", sid)