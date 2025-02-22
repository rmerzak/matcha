import logging
import socketio
logger = logging.getLogger(__name__)
from fastapi import Depends
from app.schemas.users import User
from app.core.dependencies import get_current_user_info

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=["*"],
    # namespaces=['/ws']
    )

@sio.on('connect_error')
async def connect_error(sid, data):
    print(f"Connection error: {data}")
    
@sio.on('error')
async def error_handler(sid, data):
    print(f"Error: {data}")
from app.core.middleware import inject
# from app.managers.socketio_manager import socket_manager
from app.core.container import Container
from app.services.socketio_manager_interface import ISocketIOManager
from dependency_injector.wiring import Provide
# connection events
@sio.on('connect')
@inject
async def connection(sid, environ, *args,socketio_manager: ISocketIOManager = Depends(Provide[Container.socketio_manager]), **kwargs ):
    # await socket_manager.connect_socket(websocket=websocket)
    user = await socketio_manager.authenticate_connection(sid, environ)
    logger.info(f"User authenticated: {user}")
    if not user:
        logger.warning(f"Authentication failed for socket {sid}")
        return False
    logger.info(f"User authenticated: {user}")
    await sio.emit('welcome', {'message': 'Connected successfully!'}, sid)
    # if not user:
    #     logger.warning(f"Authentication failed for socket {sid}")
    #     return False
    await sio.emit('welcome', {'message': 'Connected successfully!'}, sid)

@sio.on('disconnect')
async def disconnect(sid):
    logger.info('Client disconnected - SID: %s', sid)
    await sio.emit('goodbye', {'message': 'Disconnected successfully!'}, room=sid)
    
@sio.on('message')
async def message(sid, data):
    logger.info('Message received - SID: %s, Data: %s', sid, data)
    await sio.emit('message_response', {'message': 'Message received!'}, sid)
