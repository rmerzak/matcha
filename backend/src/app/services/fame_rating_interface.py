from abc import ABC, abstractmethod

class IFameRatingService(ABC):
    @abstractmethod
    async def update_fame_rating(self, user_id: str, rating_change: float, reason: str = None):
        pass
    
    @abstractmethod
    async def get_fame_rating(self, user_id: str):
        pass
    
    @abstractmethod
    async def get_fame_rating_history(self, user_id: str):
        pass 