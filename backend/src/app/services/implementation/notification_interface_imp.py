from app.services.base_service import BaseService
from app.core.responce import error_response, success_response
from app.repository.notification_repository import NotificationRepository
from app.services.notification_interface import INotificationService
from app.services.socketio_manager_interface import ISocketIOManager
from app.services.user_interface import IUserService
from typing import Dict, Optional
import logging
logger = logging.getLogger(__name__)

class NotificationServiceImp(BaseService, INotificationService):
    def __init__(
        self,
        notification_repository: NotificationRepository,
        socketio_manager: ISocketIOManager,
        user_service: IUserService
    ):
        self.notification_repository = notification_repository
        self.socketio_manager = socketio_manager
        self.user_service = user_service

    async def create_and_send_notification(
        self, 
        user_id: str, 
        sender_id: str, 
        notification_type: str, 
        content: str,
        event_name: str = "notification"
    ) -> Dict:
        """Create a notification and send it via WebSocket"""
        try:
            # Create notification in database
            notification = await self.notification_repository.create_notification(
                user_id, sender_id, notification_type, content
            )
            
            if not notification:
                return None
                
            # Get sender details for the notification payload
            sender = await self.user_service.get_user_by_id_data(sender_id)
            logger.info(f"sender {sender['id']}")
            if not sender:
                return notification
                
            # Prepare notification data for WebSocket
            notification_data = {
                "event": event_name,
                "data": {
                    "id": str(notification["id"]),
                    "type": notification["type"],
                    "content": notification["content"],
                    "sender": {
                        "id": str(sender["id"]),
                        "username": sender.get("username"),
                        "profile_picture": sender.get("profile_picture")
                    },
                    "created_at": notification["created_at"].isoformat() if notification["created_at"] else None
                }
            }
            
            # Send notification via WebSocket
            logger.info("notification_data" ,notification_data)
            logger.info("user_id" ,user_id)
            await self.socketio_manager.send_event(event_name, notification_data, user_id)
            
            return notification
            
        except Exception as e:
            print(f"Error creating/sending notification: {str(e)}")
            return None

    async def send_like_notification(self, user_id: str, sender_id: str) -> Dict:
        """Send notification when a user receives a like"""
        return await self.create_and_send_notification(
            user_id, 
            sender_id, 
            "like_received", 
            "Someone liked your profile",
            "new_like"
        )

    async def send_match_notification(self, user_id: str, sender_id: str) -> Dict:
        """Send notification when a match is created"""
        return await self.create_and_send_notification(
            user_id, 
            sender_id, 
            "match_created", 
            "You have a new match!",
            "new_match"
        )

    async def send_unlike_notification(self, user_id: str, sender_id: str) -> Dict:
        """Send notification when a user is unliked (connection broken)"""
        return await self.create_and_send_notification(
            user_id, 
            sender_id, 
            "match_broken", 
            "A match has been broken",
            "connection_broken"
        )
        
    async def get_user_notifications(self, user_id: str):
        """Get all notifications for a user"""
        try:
            user = await self.user_service.get_user_by_id(user_id)
            if not user:
                return error_response("User not found", "User does not exist", 404)
                
            notifications = await self.notification_repository.get_user_notifications(user_id)
            
            return success_response(
                data=notifications,
                message="Notifications retrieved successfully",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error",
                f"Error retrieving notifications: {str(e)}",
                status_code=500
            )
            
    async def mark_notification_as_read(self, notification_id: str):
        """Mark a notification as read"""
        try:
            success = await self.notification_repository.mark_notification_as_read(notification_id)
            if not success:
                return error_response("Not found", "Notification not found", 404)
                
            return success_response(
                data={"notification_id": notification_id},
                message="Notification marked as read",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error",
                f"Error marking notification as read: {str(e)}",
                status_code=500
            )

    async def mark_as_read(self, user_id: str):
        """Mark all notifications as read for a user"""
        try:
            user = await self.user_service.get_user_by_id(user_id)
            if not user:
                return error_response("User not found", "User does not exist", 404)
            
            success = await self.notification_repository.mark_all_notifications_as_read(user_id)
            if not success:
                return error_response("Not found", "No unread notifications found", 404)
            
            return success_response(
                data={"user_id": user_id},
                message="All notifications marked as read",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error",
                f"Error marking notifications as read: {str(e)}",
                status_code=500
            )