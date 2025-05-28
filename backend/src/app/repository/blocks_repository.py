from app.repository.base_repository import BaseRepository
from typing import List, Optional, Tuple, Dict, Any
import uuid

class BlocksRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db
    
    async def create_block(self, user_id: str, blocked_user_id: str) -> str:
        """Create a new block between users"""
        block_id = str(uuid.uuid4())
        query = """
            INSERT INTO blocks (id, user_id, blocked_user_id, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id
        """
        result = await self.db.fetch_one(query, block_id, user_id, blocked_user_id)
        return result["id"]
    
    async def delete_block(self, user_id: str, blocked_user_id: str) -> bool:
        """Remove a block between users"""
        query = """
            DELETE FROM blocks
            WHERE user_id = $1 AND blocked_user_id = $2
        """
        await self.db.execute(query, user_id, blocked_user_id)
        return True
    
    async def get_block(self, blocker_id: str, blocked_id: str) -> Optional[dict]:
        """Get a specific block between two users"""
        try:
            query = """
                SELECT id, blocker, blocked, block_time
                FROM blocks
                WHERE blocker = :blocker_id AND blocked = :blocked_id
            """
            result = await self.db.fetch_one(
                query=query,
                values={"blocker_id": blocker_id, "blocked_id": blocked_id}
            )
            return result
        except Exception as e:
            raise Exception(f"Error getting block: {str(e)}")
    
    async def get_blocked_users(self, user_id: str) -> dict:
        """Get all users blocked by the current user"""
        try:
            count_query = """
                SELECT COUNT(*) 
                FROM blocks
                WHERE blocker = :user_id
            """
            
            query = """
                SELECT u.id, u.username, u.first_name, u.last_name, 
                       u.gender, u.profile_picture, u.fame_rating, u.age, u.bio,
                       b.block_time, b.id as block_id
                FROM blocks b
                JOIN users u ON b.blocked = u.id
                WHERE b.blocker = :user_id
                ORDER BY b.block_time DESC
            """
            
            total_count = await self.db.fetch_val(
                query=count_query, 
                values={"user_id": user_id}
            )
            
            results = await self.db.fetch_all(
                query=query, 
                values={"user_id": user_id}
            )
            
            users_list = []
            for row in results:
                user_dict = dict(row)
                users_list.append(user_dict)
            
            return {
                "total": total_count,
                "users": users_list
            }
        except Exception as e:
            raise Exception(f"Error getting blocked users: {str(e)}")
    
    async def is_user_blocked(self, user_id: str, other_user_id: str) -> bool:
        """Check if either user has blocked the other"""
        query = """
            SELECT id FROM blocks
            WHERE (user_id = $1 AND blocked_user_id = $2)
               OR (user_id = $2 AND blocked_user_id = $1)
        """
        result = await self.db.fetch_one(query, user_id, other_user_id)
        return result is not None
        
    async def add_block(self, blocker_id: str, blocked_id: str) -> dict:
        """Add a block from one user to another
        
        This prevents a user from blocking someone who has already blocked them,
        to avoid potential privacy issues where a user could circumvent being blocked.
        """
        try:
            # First check if the other user has already blocked this user
            check_reverse_block_query = """
                SELECT id FROM blocks
                WHERE blocker = :blocked_id AND blocked = :blocker_id
            """
            existing_reverse_block = await self.db.fetch_one(
                query=check_reverse_block_query, 
                values={"blocker_id": blocker_id, "blocked_id": blocked_id}
            )
            
            if existing_reverse_block:
                raise Exception("Cannot block a user who has already blocked you")
            
            # Check if the block already exists
            check_query = """
                SELECT id FROM blocks
                WHERE blocker = :blocker_id AND blocked = :blocked_id
            """
            existing_block = await self.db.fetch_one(
                query=check_query, 
                values={"blocker_id": blocker_id, "blocked_id": blocked_id}
            )
            
            if existing_block:
                return existing_block
            
            # If no existing block, create a new one
            query = """
                INSERT INTO blocks (blocker, blocked)
                VALUES (:blocker_id, :blocked_id)
                RETURNING id, blocker, blocked, block_time
            """
            result = await self.db.fetch_one(
                query=query, 
                values={"blocker_id": blocker_id, "blocked_id": blocked_id}
            )
            return result
        except Exception as e:
            raise Exception(f"Error adding block: {str(e)}")
    
    async def unblock_user(self, blocker_id: str, blocked_id: str) -> bool:
        """Remove a block from one user to another"""
        try:
            query = """
                DELETE FROM blocks
                WHERE blocker = :blocker_id AND blocked = :blocked_id
                RETURNING id
            """
            result = await self.db.fetch_one(
                query=query, 
                values={"blocker_id": blocker_id, "blocked_id": blocked_id}
            )
            return result is not None
        except Exception as e:
            raise Exception(f"Error removing block: {str(e)}")
    
    async def check_block(self, user_id1: str, user_id2: str) -> bool:
        """Check if either user has blocked the other"""
        try:
            query = """
                SELECT EXISTS(
                    SELECT 1 FROM blocks 
                    WHERE (blocker = :user_id1 AND blocked = :user_id2)
                    OR (blocker = :user_id2 AND blocked = :user_id1)
                )
            """
            result = await self.db.fetch_val(
                query=query, 
                values={"user_id1": user_id1, "user_id2": user_id2}
            )
            return result
        except Exception as e:
            raise Exception(f"Error checking block: {str(e)}")
        