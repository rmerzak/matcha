from app.repository.base_repository import BaseRepository
from typing import List, Optional, Dict
from datetime import datetime

class MessageRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db

    async def create_message(self, sender_id: str, receiver_id: str, content: str) -> Dict:
        """Create a new message"""
        try:
            query = """
                INSERT INTO messages (sender, receiver, content)
                VALUES (:sender_id, :receiver_id, :content)
                RETURNING id, sender, receiver, content, is_read, sent_at
            """
            result = await self.db.fetch_one(
                query=query,
                values={
                    "sender_id": sender_id,
                    "receiver_id": receiver_id,
                    "content": content
                }
            )
            return dict(result)
        except Exception as e:
            raise Exception(f"Error creating message: {str(e)}")

    async def get_chat_history(
        self,
        user_id: str,
        other_user_id: str
    ) -> Dict:
        """Get chat history between two users"""
        try:
            query = """
                SELECT id, sender, receiver, content, is_read, sent_at
                FROM messages
                WHERE (sender = :user_id AND receiver = :other_user_id)
                   OR (sender = :other_user_id AND receiver = :user_id)
                ORDER BY sent_at DESC
            """
            
            messages = await self.db.fetch_all(
                query=query,
                values={
                    "user_id": user_id,
                    "other_user_id": other_user_id
                }
            )
            
            return {
                "messages": [dict(msg) for msg in messages]
            }
        except Exception as e:
            raise Exception(f"Error getting chat history: {str(e)}")