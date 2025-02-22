from abc import ABC, abstractmethod
from app.schemas.users import UserCreate, UserLogin, User
from typing import Optional
from typing import Any

class ISocketIOManager(ABC):
    @abstractmethod
    async def authenticate_connection(self, sid: str, environ) -> Optional[User]:
        pass

    # @abstractmethod
    # async def connect_socket(self, sid: str, user: User):
    #     pass

    # @abstractmethod
    # async def disconnect_socket(self, sid: str):
    #     pass
    # @abstractmethod
    # async def remove_user_from_chat(self, chat_id: str, sid: str):
    #     pass
    # @abstractmethod
    # async def add_user_socket_connection(self, user_uid: str, sid: str):
    #     pass

    # @abstractmethod
    # async def add_user_to_chat(self, chat_id: str, sid: str):
    #     pass
    # @abstractmethod
    # async def broadcast_to_chat(self, chat_id: str, event: str, data: Any):
    #     pass
    # @abstractmethod
    # def get_user_for_sid(self, sid: str) -> Optional[User]:
    #     pass
    
    # @abstractmethod
    # async def send_error(self, message: str, sid: str):
    #     pass

    # @abstractmethod
    # async def close_scoped_session(self):
    #     pass
