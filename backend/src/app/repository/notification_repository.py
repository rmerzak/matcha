from app.repository.base_repository import BaseRepository
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID
import logging
logger = logging.getLogger(__name__)

class NotificationRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db

    async def create_notification(self, user_id: str, sender_id: str, notification_type: str, content: str) -> Dict:
        """Create a new notification"""
        query = """
            INSERT INTO notifications (user_id, sender_id, type, content)
            VALUES (:user_id, :sender_id, :type, :content)
            RETURNING id, user_id, sender_id, type, content, is_read, created_at
        """
        logger.info(f"Creating notification for user {user_id} with sender {sender_id}, type {notification_type}, and content {content}")
        values = {
            "user_id": user_id,
            "sender_id": sender_id,
            "type": notification_type,
            "content": content
        }
        
        result = await self.db.fetch_one(query, values)
        return dict(result) if result else None
    
    async def mark_notification_as_read(self, notification_id: str) -> bool:
        """Mark a notification as read"""
        query = """
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = :notification_id
            RETURNING id
        """
        result = await self.db.fetch_one(query, {"notification_id": notification_id})
        return bool(result)
    
    async def mark_all_notifications_as_read(self, user_id: str) -> bool:
        """Mark all notifications as read for a user"""
        query = """
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = :user_id AND is_read = FALSE
            RETURNING id
        """
        results = await self.db.fetch_all(query, {"user_id": user_id})
        return len(results) > 0
    
    async def get_user_notifications(self, user_id: str) -> List[Dict]:
        """Get all notifications for a user without pagination"""
        query = """
            SELECT n.*, u.username, u.profile_picture
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = :user_id
            ORDER BY n.created_at DESC
        """
        
        results = await self.db.fetch_all(query, {"user_id": user_id})
        return [dict(row) for row in results] if results else []