from abc import ABC, abstractmethod

class INotificationService(ABC):
    # @abstractmethod
    # async def send_notification(self, user_id: str, sender_id: str, notification_type: str, content: str):
    #     pass
    @abstractmethod
    async def send_like_notification(self, user_id: str, sender_id: str):
        pass
    @abstractmethod
    async def send_unlike_notification(self, user_id: str, sender_id: str):
        pass
    @abstractmethod
    async def send_match_notification(self, user_id: str, sender_id: str):
        pass
    @abstractmethod
    # async def send_view_notification(self, message: dict, user_id: str):
    #     pass
    # @abstractmethod
    # async def send_message_notification(self, message: dict, user_id: str):
    #     pass
    @abstractmethod
    async def get_user_notifications(self, user_id: str):
        pass
    @abstractmethod
    async def mark_notification_as_read(self, notification_id: str):
        pass
    @abstractmethod
    async def mark_as_read(self, user_id: str):
        pass