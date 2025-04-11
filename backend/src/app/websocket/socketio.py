# import logging
# import socketio
# logger = logging.getLogger(__name__)
# from fastapi import Depends
# from app.schemas.users import User
# from app.core.dependencies import get_current_user_info

# sio = socketio.AsyncServer(
#     async_mode='asgi',
#     cors_allowed_origins=["*"],
#     # namespaces=['/ws']
#     )

# @sio.on('connect_error')
# async def connect_error(sid, data):
#     print(f"Connection error: {data}")
    
# @sio.on('error')
# async def error_handler(sid, data):
#     print(f"Error: {data}")
# from app.core.middleware import inject
# # from app.managers.socketio_manager import socket_manager
# from app.core.container import Container
# from app.services.socketio_manager_interface import ISocketIOManager
# from dependency_injector.wiring import Provide
# # connection events
# @sio.on('connect')
# @inject
# async def connection(sid, environ, socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager]),*args, **kwargs ):
#     # await socket_manager.connect_socket(websocket=websocket)
#     user = await socketio_manager.authenticate_connection(sid, environ)
#     logger.info(f"User authenticated: {user}")
#     if not user:
#         logger.warning(f"Authentication failed for socket {sid}")
#         return False
#     logger.info(f"User authenticated: {user}")
#     await sio.emit('welcome', {'message': 'Connected successfully!'}, sid)

# @sio.on('disconnect')
# async def disconnect(sid):
#     logger.info('Client disconnected - SID: %s', sid)
#     await sio.emit('goodbye', {'message': 'Disconnected successfully!'}, sid)


import logging
import socketio
from fastapi import Depends
from app.schemas.users import User
from app.core.dependencies import get_current_user_info
from app.core.middleware import inject
from app.core.container import Container
from app.services.socketio_manager_interface import ISocketIOManager
from dependency_injector.wiring import Provide
from typing import Optional

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
async def connect(sid: str, environ: dict,
                socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager])) -> bool:
    """Handle new connections"""
    try:
        user = await socketio_manager.authenticate_connection(sid, environ)
        logger.info(f"User: {user}")
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
        logger.info(f"User: {user}")
        await socketio_manager.disconnect_socket(sid)
        if user:
            logger.info(f"User {user['username']} disconnected - SID: {sid}")
        else:
            logger.info(f"Unknown user disconnected - SID: {sid}")
    except Exception as e:
        logger.error(f"Error during disconnection for SID {sid}: {str(e)}")
        await socketio_manager.send_error("Disconnection failed", sid)
    finally:
        logger.info(f"User *****")
        await socketio_manager.close_scoped_session()

from typing import Dict
@sio.on('message')
@inject
async def message(
    sid: str,
    data: Dict,
    socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager])
) -> None:
    """
    Handle incoming Socket.IO messages and respond with user mapping.
    Args:
        sid: Session ID of the connected client
        data: Message data received from client
        socketio_manager: Injected Socket.IO manager instance
    """
    # Get the user-to-sid mapping
    user_mapping = socketio_manager.get_user_uid_to_sid()
    # Convert sets to lists to ensure JSON serialization works
    user_dict = {uid: list(sids) for uid, sids in user_mapping.items()}
    # Log the processed mapping and message data
    logger.info("User mapping: %s", user_dict)
    logger.info("Message receivereceivedd - SID: %s, Data: %s", sid, data)
    # Emit the response with the JSON-serializable dictionary
    await sio.emit('message_response', {'message': user_dict}, sid)