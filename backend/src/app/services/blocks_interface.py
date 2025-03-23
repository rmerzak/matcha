from abc import ABC, abstractmethod
from typing import Optional

class IBlocksService(ABC):
    @abstractmethod
    async def block_user(self, blocker_id: str, blocked_id: str) -> bool:
        pass
    
    @abstractmethod
    async def unblock_user(self, blocker_id: str, blocked_id: str) -> bool:
        pass
    
    @abstractmethod
    async def get_blocked_users(self, blocker_id: str, page: int = 1, items_per_page: int = 10) -> list[dict]:
        pass
    
    @abstractmethod
    async def check_block_status(self, blocker_id: str, blocked_id: str) -> bool:
        pass
    