from abc import ABC, abstractmethod
from typing import Optional

class ILikesService(ABC):
    @abstractmethod
    async def add_like(self, user_id: str, liked_user_id: str):
        pass
    
    @abstractmethod
    async def unlike_user(self, user_id: str, unliked_user_id: str):
        pass
    
    @abstractmethod
    async def get_like_status(self, user_id: str, other_user_id: str):
        pass
    
    @abstractmethod
    async def get_likes_statistics(self, user_id: str):
        pass
    
    @abstractmethod
    async def get_users_who_liked_me(
        self, 
        user_id: str, 
        connection_status: Optional[bool] = None
    ):
        pass
    # @abstractmethod
    # async def remove_like(self, user_id: str, liked_user_id: str):
    #     pass