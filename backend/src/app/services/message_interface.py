from abc import ABC, abstractmethod
from typing import Optional

class IMessageService(ABC):
    @abstractmethod
    async def send_message(self, message: str, sender_id: str, receiver_id: str):
        pass
    
    