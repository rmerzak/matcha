
from urllib.parse import parse_qs
from app.services.base_service import BaseService
from app.services.socketio_manager_interface import ISocketIOManager
from app.repository.user_repository import UserRepository
from app.services.auth_interface import IAuthService
from app.schemas.users import User
from typing import Optional, Dict, Set, Any
import logging
from app.core.security import verify_token
import jwt
from socketio import AsyncServer
from app.schemas.users import User

logger = logging.getLogger(__name__)

# class SocketIOManagerImp(BaseService, ISocketIOManager):
#     def __init__(self, user_repository: UserRepository, auth_service: IAuthService, sio: AsyncServer):
#         self.user_repository = user_repository
#         self.auth_service = auth_service
#         self.sio = sio
#         self.chats: Dict[str, Set[str]] = {}
#         self.user_uid_to_sid: Dict[str, Set[str]] = {}
#         self.sid_to_user: Dict[str, User] = {}
#         super().__init__(user_repository)

#     async def authenticate_connection(self, sid: str, environ) -> Optional[User]:
#         """Authenticate user from token in query string or headers"""
#         try:
#             logger.info(f"Environ: {environ}")
#             http_headers = environ.get('HTTP_AUTHORIZATION', '')
#             query = environ.get('QUERY_STRING', '')
#             from urllib.parse import parse_qs
#             params = parse_qs(query)
#             token = params.get('token', [None])[0]
#             if not token and http_headers.startswith('Bearer '):
#                 token = http_headers.split(' ')[1]

#             if not token:
#                 logger.error(f"No authentication token provided for SID: {sid}")
#                 return None

#             user = await self.auth_service.get_me(token)
#             if not user:
#                 logger.error(f"User not found for token: {token}")
#                 return None

#             user_dict = dict(user)
#             logger.info(f"User dict: {user_dict}")
#             user_id = str(user_dict['id']).replace('UUID(\'', '').replace('\')', '')  # Extract UUID value
#             self.sid_to_user[sid] = user_dict
#             await self.add_user_socket_connection(user_id, sid)
#             return user_dict

#         except jwt.InvalidTokenError as e:
#             logger.error(f"Invalid token for SID {sid}: {str(e)}")
#             return None
#         except Exception as e:
#             logger.error(f"Authentication error for SID {sid}: {str(e)}")
#             return None

#     async def connect_socket(self, sid: str, user: User):
#         """Handle new socket connection"""
#         try:
#             user_dict = dict(user)
#             self.sid_to_user[sid] = user_dict
#             user_id = str(user_dict['id']).replace('UUID(\'', '').replace('\')', '')  # Extract UUID value
#             await self.add_user_socket_connection(user_id, sid)
#             logger.info(f"Socket {sid} connected for user {user_id}")
#         except Exception as e:
#             logger.error(f"Error connecting socket {sid}: {str(e)}")
#             await self.send_error("Failed to establish connection", sid)

#     async def disconnect_socket(self, sid: str):
#         """Handle socket disconnection"""
#         try:
#             user = self.sid_to_user.pop(sid, None)
#             if user:
#                 user_id = str(user['id']).replace('UUID(\'', '').replace('\')', '')  # Extract UUID value
#                 if user_id in self.user_uid_to_sid:
#                     self.user_uid_to_sid[user_id].discard(sid)
#                     if not self.user_uid_to_sid[user_id]:
#                         del self.user_uid_to_sid[user_id]

#                 # Remove from all chats
#                 for chat_id in list(self.chats.keys()):
#                     if sid in self.chats[chat_id]:
#                         await self.remove_user_from_chat(chat_id, sid)

#             logger.info(f"Socket {sid} disconnected")
#         except Exception as e:
#             logger.error(f"Error during socket disconnection for SID {sid}: {str(e)}")

#     async def remove_user_from_chat(self, chat_id: str, sid: str):
#         """Remove a user's socket from a chat room"""
#         try:
#             if chat_id in self.chats:
#                 self.chats[chat_id].discard(sid)
#                 if not self.chats[chat_id]:
#                     del self.chats[chat_id]
#                 await self.sio.leave_room(sid, chat_id)
#                 logger.info(f"Removed socket {sid} from chat {chat_id}")
#         except Exception as e:
#             logger.error(f"Error removing user from chat {chat_id}: {str(e)}")

#     async def add_user_socket_connection(self, user_uid: str, sid: str):
#         """Add a socket connection for a user"""
#         try:
#             if user_uid not in self.user_uid_to_sid:
#                 self.user_uid_to_sid[user_uid] = set()
#             self.user_uid_to_sid[user_uid].add(sid)
#             logger.info(f"Added socket connection {sid} for user {user_uid}")
#         except Exception as e:
#             logger.error(f"Error adding socket connection for user {user_uid}: {str(e)}")

#     async def add_user_to_chat(self, chat_id: str, sid: str):
#         """Add a user's socket to a chat room"""
#         try:
#             if chat_id not in self.chats:
#                 self.chats[chat_id] = set()
#             self.chats[chat_id].add(sid)
#             await self.sio.enter_room(sid, chat_id)
#             logger.info(f"Added socket {sid} to chat {chat_id}")
#         except Exception as e:
#             logger.error(f"Error adding user to chat {chat_id}: {str(e)}")
#             await self.send_error(f"Failed to join chat {chat_id}", sid)

#     async def broadcast_to_chat(self, chat_id: str, event: str, data: Any):
#         """Broadcast a message to all users in a chat room"""
#         try:
#             if chat_id in self.chats:
#                 await self.sio.emit(event, data, room=chat_id)
#                 logger.info(f"Broadcasted event {event} to chat {chat_id}")
#         except Exception as e:
#             logger.error(f"Error broadcasting to chat {chat_id}: {str(e)}")

#     def get_user_for_sid(self, sid: str) -> Optional[User]:
#         """Get user information for a socket ID"""
#         return self.sid_to_user.get(sid)

#     async def send_error(self, message: str, sid: str):
#         """Send an error message to a specific socket"""
#         try:
#             await self.sio.emit('error', {'message': message}, room=sid)
#             logger.error(f"Sent error to {sid}: {message}")
#         except Exception as e:
#             logger.error(f"Error sending error message to {sid}: {str(e)}")

#     async def close_scoped_session(self):
#         """Close the database session"""
#         try:
#             if hasattr(self, 'session'):
#                 await self.session.close()
#             logger.info("Closed scoped session")
#         except Exception as e:
#             logger.error(f"Error closing scoped session: {str(e)}")

#     def get_user_uid_to_sid(self) -> Dict[str, Set[str]]:
#         return self.user_uid_to_sid

#     def get_sid_to_user(self) -> Dict[str, User]:
#         return self.sid_to_user

# class SocketIOManagerImp(BaseService, ISocketIOManager):
#     def __init__(self, user_repository: UserRepository, auth_service: IAuthService, sio: AsyncServer):
#         self.user_repository = user_repository
#         self.auth_service = auth_service
#         self.sio = sio
#         # Use better data structure initialization
#         self.chats = {}  # chat_id -> Set[sid]
#         self.user_uid_to_sid = {}  # user_id -> Set[sid]
#         self.sid_to_user = {}  # sid -> User
#         super().__init__(user_repository)

#     async def add_user_socket_connection(self, user_id: str, sid: str):
#         """Helper method to manage user socket connections"""
#         if user_id not in self.user_uid_to_sid:
#             self.user_uid_to_sid[user_id] = set()
#         self.user_uid_to_sid[user_id].add(sid)
#         logger.info(f"Added socket connection {sid} for user {user_id}")
#         logger.info(f"Current user_uid_to_sid mapping: {self.user_uid_to_sid}")

#     def get_user_uid_to_sid(self) -> Dict[str, Set[str]]:
#         """Get the current user_uid to sid mapping"""
#         return self.user_uid_to_sid

#     def get_user_for_sid(self, sid: str) -> Optional[Dict]:
#         """Get user info for a given sid"""
#         return self.sid_to_user.get(sid)

#     async def authenticate_connection(self, sid: str, environ) -> Optional[User]:
#         """Authenticate user from token in query string or headers"""
#         try:
#             # Extract token from headers or query string
#             http_headers = environ.get('HTTP_AUTHORIZATION', '')
#             query = environ.get('QUERY_STRING', '')
#             params = parse_qs(query)
#             token = params.get('token', [None])[0]
            
#             if not token and http_headers.startswith('Bearer '):
#                 token = http_headers.split(' ')[1]

#             if not token:
#                 logger.error(f"No authentication token provided for SID: {sid}")
#                 return None

#             user = await self.auth_service.get_me(token)
#             if not user:
#                 logger.error(f"User not found for token: {token}")
#                 return None

#             # Convert user to dict and clean UUID format
#             user_dict = dict(user)
#             user_id = str(user_dict['id']).replace('UUID(\'', '').replace('\')', '')
            
#             # Store user information
#             self.sid_to_user[sid] = user_dict
#             await self.add_user_socket_connection(user_id, sid)
            
#             # Log current state
#             logger.info(f"Authenticated user {user_id} with sid {sid}")
#             logger.info(f"Current mappings - user_uid_to_sid: {self.user_uid_to_sid}")
#             logger.info(f"Current mappings - sid_to_user: {self.sid_to_user}")
            
#             return user_dict

#         except Exception as e:
#             logger.error(f"Authentication error for SID {sid}: {str(e)}")
#             return None

#     async def disconnect_socket(self, sid: str):
#         """Handle socket disconnection"""
#         try:
#             user = self.sid_to_user.pop(sid, None)
#             if user:
#                 user_id = str(user['id']).replace('UUID(\'', '').replace('\')', '')
                
#                 # Remove from user_uid_to_sid mapping
#                 if user_id in self.user_uid_to_sid:
#                     self.user_uid_to_sid[user_id].discard(sid)
#                     if not self.user_uid_to_sid[user_id]:
#                         del self.user_uid_to_sid[user_id]

#                 # Remove from all chats
#                 for chat_id in list(self.chats.keys()):
#                     if sid in self.chats[chat_id]:
#                         self.chats[chat_id].discard(sid)
#                         if not self.chats[chat_id]:
#                             del self.chats[chat_id]

#                 logger.info(f"Disconnected socket {sid} for user {user_id}")
#                 logger.info(f"Updated mappings - user_uid_to_sid: {self.user_uid_to_sid}")
            
#         except Exception as e:
#             logger.error(f"Error during socket disconnection for SID {sid}: {str(e)}")


logger = logging.getLogger(__name__)

class SocketIOManagerImp(BaseService, ISocketIOManager):
    _instance = None
    _initialized = False
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, user_repository: UserRepository, auth_service: IAuthService, sio: AsyncServer):
        if not self._initialized:
            super().__init__(user_repository)
            self.user_repository = user_repository
            self.auth_service = auth_service
            self.sio = sio
            self._user_uid_to_sid: Dict[str, Set[str]] = {}
            self._sid_to_user: Dict[str, dict] = {}
            self._chats: Dict[str, Set[str]] = {}
            self._initialized = True

    def _serialize_data(self, data: Any) -> Any:
        """Helper method to serialize data and handle UUID objects"""
        if isinstance(data, dict):
            return {key: self._serialize_data(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._serialize_data(item) for item in data]
        elif isinstance(data, set):
            return [self._serialize_data(item) for item in data]
        elif hasattr(data, 'uuid'):  # For UUID objects
            return str(data)
        elif str(type(data)) == "<class 'uuid.UUID'>":  # Direct UUID class check
            return str(data)
        return data

    @property
    def user_uid_to_sid(self) -> Dict[str, Set[str]]:
        return self._user_uid_to_sid

    @property
    def sid_to_user(self) -> Dict[str, dict]:
        return self._sid_to_user

    async def add_user_socket_connection(self, user_id: str, sid: str) -> None:
        """Add a new socket connection for a user"""
        if user_id not in self._user_uid_to_sid:
            self._user_uid_to_sid[user_id] = set()
        self._user_uid_to_sid[user_id].add(sid)
        logger.info(f"Added socket connection. Current state - user_uid_to_sid: {self._user_uid_to_sid}")

    def get_user_uid_to_sid(self) -> Dict[str, Set[str]]:
        """Get current user to socket mappings"""
        return self._user_uid_to_sid

    def get_user_for_sid(self, sid: str) -> Optional[dict]:
        """Get user info for a socket ID"""
        return self._sid_to_user.get(sid)

    # def get_sids_for_uid(self, uid: str) -> Set[str]:
    #     """Get all socket IDs for a user"""
    #     return self._user_uid_to_sid.get(uid, set())
    def get_sids_for_uid(self, uid: str) -> Set[str]:
        """Get all socket IDs for a user"""
        # Clean the UUID format if needed
        cleaned_uid = str(uid).replace('UUID(\'', '').replace('\')', '')
        return self._user_uid_to_sid.get(cleaned_uid, set())

    async def authenticate_connection(self, sid: str, environ) -> Optional[dict]:
        """Authenticate and store user connection"""
        try:
            # Extract token
            http_headers = environ.get('HTTP_AUTHORIZATION', '')
            query = environ.get('QUERY_STRING', '')
            params = parse_qs(query)
            token = params.get('token', [None])[0]
            if not token and http_headers.startswith('Bearer '):
                token = http_headers.split(' ')[1]

            if not token:
                logger.error(f"No token for SID: {sid}")
                return None

            user = await self.auth_service.get_me(token)
            if not user:
                return None

            # Store user data
            user_dict = dict(user)
            user_id = str(user_dict['id']).replace('UUID(\'', '').replace('\')', '')
            self._sid_to_user[sid] = user_dict
            await self.add_user_socket_connection(user_id, sid)
            logger.info(f"Authentication successful - User: {user_id}, SID: {sid}")
            logger.info(f"Current state - sid_to_user: {self._sid_to_user}")
            return user_dict

        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None

    async def disconnect_socket(self, sid: str) -> None:
        """Handle socket disconnection"""
        try:
            user = self._sid_to_user.get(sid)
            if user:
                user_id = str(user['id']).replace('UUID(\'', '').replace('\')', '')
                if user_id in self._user_uid_to_sid:
                    self._user_uid_to_sid[user_id].discard(sid)
                    if not self._user_uid_to_sid[user_id]:
                        del self._user_uid_to_sid[user_id]
                del self._sid_to_user[sid]
                logger.info(f"Disconnected socket {sid} for user {user_id}")
                logger.info(f"Current state - user_uid_to_sid: {self._user_uid_to_sid}")
                logger.info(f"Current state - sid_to_user: {self._sid_to_user}")

        except Exception as e:
            logger.error(f"Disconnect error: {str(e)}")

    async def send_event(self, event: str, data: Any, user_id: str) -> None:
        """Send event to client"""
        try:
            cleaned_user_id = str(user_id).replace('UUID(\'', '').replace('\')', '')
            logger.info(f"Sending event {event} to {cleaned_user_id}")
            user_sids = self.get_sids_for_uid(cleaned_user_id)
            logger.info(f"Found sids for user {cleaned_user_id}: {user_sids}")
            if user_sids:
                for sid in user_sids:
                    try:
                        logger.info(f"Attempting to emit event {event} with data: {data}")
                        await self.sio.emit(event, data, sid)
                        logger.info(f"Successfully sent event {event} to sid {sid}")
                    except Exception as e:
                        logger.error(f"Failed to send event to sid {sid}: {str(e)}")
            else:
                logger.warning(f"No active sockets found for user {cleaned_user_id}")
        except Exception as e:
            logger.error(f"Error in send_event: {str(e)}")
            logger.error(f"Original data: {data}")


    async def send_error(self, message: str, sid: str) -> None:
        """Send error message to client"""
        await self.sio.emit('error', {'message': message}, sid)

    async def close_scoped_session(self):
        await self.user_repository.close_session()