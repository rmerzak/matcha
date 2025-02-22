from typing import Dict, Set, Callable, Any, Optional
import socketio
import logging
import jwt
from app.schemas.users import User
from app.core.config import settings
from datetime import datetime
from app.core.security import verify_token
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
logger = logging.getLogger(__name__)


class SocketIOManager:

    def __init__(self):
        self.handlers: Dict[str, Callable] = {}
        self.chats: Dict[str, Set[str]] = {}  # chat_id -> set of sids
        self.user_uid_to_sid: Dict[str, Set[str]] = {}  # user_uid -> set of sids
        self.sid_to_user: Dict[str, User] = {}  # sid -> User object

    def handle(self, event: str):
        """Decorator to register event handlers"""
        def decorator(func: Callable):
            self.handlers[event] = func
            return func
        return decorator

    async def authenticate_connection(self, sid: str, environ) -> Optional[User]:
        """Authenticate user from token in query string or headers"""
        try:
            logger.info(f"Environ: {environ}")
            http_headers = environ.get('HTTP_AUTHORIZATION', '')
            logger.info(f"HTTP Headers: {http_headers}")
            query = environ.get('QUERY_STRING', '')
            from urllib.parse import parse_qs
            params = parse_qs(query)
            token = params.get('token', [None])[0]
            logger.info(f"Token: {token}")
            if not token:
                headers = environ.get('HTTP_AUTHORIZATION', '')
                if headers.startswith('Bearer '):
                    token = headers.split(' ')[1]

            if not token:
                logger.error(f"No authentication token provided for SID: {sid}")
                return None
            logger.info(f"Token: {token}")
            payload = await verify_token(token)
            logger.info(f"Payload: {payload}")
            if not payload:
                logger.error(f"Invalid token for SID {sid}: {token}")
                return None
            user = User(**payload)
            self.sid_to_user[sid] = user
            return user

        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token for SID {sid}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Authentication error for SID {sid}: {str(e)}")
            return None

    async def connect_socket(self, sid: str, user: User):
        """Handle new socket connection"""
        logger.info(f"New socket connected: {sid} for user: {user.name}")
        await self.add_user_socket_connection(user.uid, sid)
        self.sid_to_user[sid] = user

    async def add_user_socket_connection(self, user_uid: str, sid: str):
        """Associate a user's UID with their socket ID"""
        self.user_uid_to_sid.setdefault(user_uid, set()).add(sid)
        logger.debug(f"Added socket connection {sid} for user {user_uid}")

    async def add_user_to_chat(self, chat_id: str, sid: str):
        """Add a user's socket to a chat room"""
        if not self.sid_to_user.get(sid):
            logger.error(f"Attempted to add unauthenticated user (SID: {sid}) to chat {chat_id}")
            return False
        self.chats.setdefault(chat_id, set()).add(sid)
        logger.info(f"User {self.sid_to_user[sid].name} joined chat {chat_id}")
        return True

    async def remove_user_from_chat(self, chat_id: str, sid: str):
        """Remove a user's socket from a chat room"""
        if chat_id in self.chats and sid in self.chats[chat_id]:
            self.chats[chat_id].remove(sid)
            if not self.chats[chat_id]:
                del self.chats[chat_id]
            logger.info(f"User {self.sid_to_user.get(sid, 'Unknown').name} left chat {chat_id}")
            return True
        return False

    async def disconnect_socket(self, sid: str):
        """Handle socket disconnection"""
        user = self.sid_to_user.get(sid)
        if user:
            if user.uid in self.user_uid_to_sid:
                self.user_uid_to_sid[user.uid].remove(sid)
                if not self.user_uid_to_sid[user.uid]:
                    del self.user_uid_to_sid[user.uid]

            for chat_id in list(self.chats.keys()):
                if sid in self.chats[chat_id]:
                    await self.remove_user_from_chat(chat_id, sid)
            del self.sid_to_user[sid]
            logger.info(f"Disconnected socket {sid} for user {user.name}")

    async def send_error(self, message: str, sid: str, sio: socketio.AsyncServer):
        """Send error message to a specific socket"""
        await sio.emit('error', {
            "message": message,
            "status": "error",
            "timestamp": datetime.utcnow().isoformat()
        }, room=sid)

    async def broadcast_to_chat(self, chat_id: str, event: str, data: Any, sio: socketio.AsyncServer):
        """Broadcast message to all users in a chat"""
        if chat_id in self.chats:
            await sio.emit(event, data, room=list(self.chats[chat_id]))

    def get_user_for_sid(self, sid: str) -> Optional[User]:
        """Get user object for a socket ID"""
        return self.sid_to_user.get(sid)

socket_manager = SocketIOManager()
