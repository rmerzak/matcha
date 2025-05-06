from app.repository.base_repository import BaseRepository
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID

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
    
    async def get_user_notifications(self, user_id: str, page: int = 1, items_per_page: int = 20) -> Dict:
        """Get notifications for a user with pagination"""
        offset = (page - 1) * items_per_page
        
        count_query = """
            SELECT COUNT(*) as total
            FROM notifications
            WHERE user_id = :user_id
        """
        
        query = """
            SELECT n.*, u.username, u.profile_picture
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = :user_id
            ORDER BY n.created_at DESC
            LIMIT :limit OFFSET :offset
        """
        
        total = await self.db.fetch_val(count_query, {"user_id": user_id})
        
        results = await self.db.fetch_all(
            query, 
            {"user_id": user_id, "limit": items_per_page, "offset": offset}
        )
        
        return {
            "total": total,
            "page": page,
            "items_per_page": items_per_page,
            "notifications": [dict(row) for row in results]
        }