from abc import ABC, abstractmethod
from typing import Optional

class IBlocksService(ABC):
    @abstractmethod
    async def add_block(self, blocker_id: str, blocked_id: str):
        pass
    
    @abstractmethod
    async def unblock_user(self, blocker_id: str, blocked_id: str):
        pass
    
    @abstractmethod
    async def get_blocked_users(self, blocker_id: str):
        pass
    
    @abstractmethod
    async def check_block(self, blocker_id: str, blocked_id: str):
        pass
    