
from app.services.base_service import BaseService
from app.services.socketio_manager_interface import ISocketIOManager
from app.repository.user_repository import UserRepository
from app.services.auth_interface import IAuthService
from app.schemas.users import User
from typing import Optional, Dict, Set
import logging
from app.core.security import verify_token
import jwt
from app.schemas.users import User
logger = logging.getLogger(__name__)
class SocketIOManagerImp(BaseService, ISocketIOManager):
    def __init__(self, user_repository: UserRepository, auth_service: IAuthService):
        self.user_repository = user_repository
        self.auth_service = auth_service
        self.chats: Dict[str, Set[str]] = {}
        self.user_uid_to_sid: Dict[str, Set[str]] = {}
        self.sid_to_user: Dict[str, User] = {}
        super().__init__(user_repository)

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
            user = await self.auth_service.get_me(token)
            if not user:
                logger.error(f"User not found for token: {token}")
                return None
            user_dict = dict(user)
            self.sid_to_user[sid] = user_dict
            return user_dict
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token for SID {sid}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Authentication error for SID {sid}: {str(e)}")
            return None
