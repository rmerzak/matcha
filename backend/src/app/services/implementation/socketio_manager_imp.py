
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
from app.repository.blocks_repository import BlocksRepository
logger = logging.getLogger(__name__)


logger = logging.getLogger(__name__)

class SocketIOManagerImp(BaseService, ISocketIOManager):
    _instance = None
    _initialized = False
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, user_repository: UserRepository, auth_service: IAuthService, blocks_repository: BlocksRepository, sio: AsyncServer):
        if not self._initialized:
            super().__init__(user_repository)
            self.user_repository = user_repository
            self.auth_service = auth_service
            self.blocks_repository = blocks_repository
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

    def get_sids_for_uid(self, uid: str) -> Set[str]:
        """Get all socket IDs for a user"""
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