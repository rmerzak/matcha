from abc import ABC, abstractmethod
from app.schemas.users import UserCreate, UserLogin, User
from typing import Optional, Dict, Set
from typing import Any

class ISocketIOManager(ABC):
    @abstractmethod
    async def authenticate_connection(self, sid: str, environ) -> Optional[User]:
        pass

    # @abstractmethod
    # async def connect_socket(self, sid: str, user: User):
    #     pass

    @abstractmethod
    async def disconnect_socket(self, sid: str):
        pass
    # @abstractmethod
    # async def remove_user_from_chat(self, chat_id: str, sid: str):
    #     pass
    @abstractmethod
    async def add_user_socket_connection(self, user_uid: str, sid: str):
        pass

    # @abstractmethod
    # async def add_user_to_chat(self, chat_id: str, sid: str):
    #     pass
    # @abstractmethod
    # async def broadcast_to_chat(self, chat_id: str, event: str, data: Any):
    #     pass
    @abstractmethod
    def get_user_for_sid(self, sid: str) -> Optional[User]:
        pass
    @abstractmethod
    def get_user_uid_to_sid(self) -> Dict[str, Set[str]]:
        pass
    @abstractmethod
    def get_sids_for_uid(self, uid: str) -> Set[str]:
        pass
    # @abstractmethod
    # def get_sid_to_user(self) -> Dict[str, User]:
    #     pass
    @abstractmethod
    async def send_event(self, event: str, data: Any, user_id: str):
        pass
    @abstractmethod
    async def send_error(self, message: str, sid: str):
        pass

    @abstractmethod
    async def close_scoped_session(self):
        pass

    @abstractmethod
    async def set_user_online(self, user_id: str, is_online: bool):
        """Update user's online status"""
        pass
