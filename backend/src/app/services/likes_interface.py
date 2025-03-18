from abc import ABC, abstractmethod

class ILikesService(ABC):
    @abstractmethod
    async def add_like(self, user_id: str, liked_user_id: str):
        pass
    @abstractmethod
    async def get_like_status(self, user_id: str, other_user_id: str):
        pass
    # @abstractmethod
    # async def remove_like(self, user_id: str, liked_user_id: str):
    #     pass