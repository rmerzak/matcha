from app.repository.base_repository import BaseRepository
from typing import List, Optional
import uuid

class LikesRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db
        
    async def add_like(self, liker_id: str, liked_id: str) -> dict:
        """Add a like from one user to another"""
        try:
            query = """
                INSERT INTO likes (liker, liked)
                VALUES (:liker_id, :liked_id)
                ON CONFLICT (liker, liked) DO NOTHING
                RETURNING id, liker, liked, like_time, is_connected
            """
            result = await self.db.fetch_one(query, {"liker_id": liker_id, "liked_id": liked_id})
            return result
        except Exception as e:
            raise Exception(f"Error adding like: {str(e)}")
    
    async def check_mutual_like(self, user_id: str, target_user_id: str) -> Optional[dict]:
        """Check if the target user has already liked the current user"""
        try:
            query = """
                SELECT id, liker, liked, like_time, is_connected
                FROM likes
                WHERE liker = :target_user_id AND liked = :user_id
            """
            result = await self.db.fetch_one(query, {
                "target_user_id": target_user_id,
                "user_id": user_id
            })
            return result
        except Exception as e:
            raise Exception(f"Error checking mutual like: {str(e)}")
    
    async def update_connection_status(self, user_id: str, target_user_id: str) -> None:
        """Update the is_connected status to True for both likes between two users"""
        try:
            query = """
                UPDATE likes
                SET is_connected = TRUE
                WHERE (liker = :user_id AND liked = :target_user_id) 
                   OR (liker = :target_user_id AND liked = :user_id)
            """
            await self.db.execute(query, {
                "user_id": user_id,
                "target_user_id": target_user_id
            })
        except Exception as e:
            raise Exception(f"Error updating connection status: {str(e)}")

    async def check_like_exists(self, liker_id: str, liked_id: str) -> bool:
        """
        Check if a like exists from liker to liked user
        """
        query = """
            SELECT EXISTS(
                SELECT 1 FROM likes 
                WHERE liker = :liker_id AND liked = :liked_id
            )
        """
        params = {"liker_id": liker_id, "liked_id": liked_id}
        result = await self.db.fetch_val(query, params)
        return result

    async def check_mutual_like(self, user_id1: str, user_id2: str) -> bool:
        """
        Check if there is a mutual like between two users
        """
        query = """
            SELECT EXISTS(
                SELECT 1 FROM likes AS l1
                JOIN likes AS l2 ON l1.liker = l2.liked AND l1.liked = l2.liker
                WHERE (l1.liker = :user_id1 AND l1.liked = :user_id2)
            )
        """
        params = {"user_id1": user_id1, "user_id2": user_id2}
        result = await self.db.fetch_val(query, params)
        return result

    async def check_connection_status(self, user_id1: str, user_id2: str) -> bool:
        """
        Check if two users are connected (matched and connection confirmed)
        """
        query = """
            SELECT is_connected FROM likes
            WHERE (liker = :user_id1 AND liked = :user_id2)
            OR (liker = :user_id2 AND liked = :user_id1)
            LIMIT 1
        """
        params = {"user_id1": user_id1, "user_id2": user_id2}
        result = await self.db.fetch_val(query, params)
        return result if result is not None else False

    async def get_likes_statistics(self, user_id: str) -> dict:
        """
        Get like statistics for a user, including:
        - Total count of people who liked them
        - Count of people they're connected with
        - Count of people who liked them but are not connected
        """
        try:
            likes_count_query = """
                SELECT COUNT(*) FROM likes
                WHERE liked = :user_id
            """
            
            connected_count_query = """
                SELECT COUNT(*) FROM likes
                WHERE liked = :user_id AND is_connected = true
            """
            
            not_connected_count_query = """
                SELECT COUNT(*) FROM likes
                WHERE liked = :user_id AND is_connected = false
            """
            
            params = {"user_id": user_id}
            
            total_likes = await self.db.fetch_val(likes_count_query, params)
            connected_likes = await self.db.fetch_val(connected_count_query, params)
            not_connected_likes = await self.db.fetch_val(not_connected_count_query, params)
            
            return {
                "total_likes": total_likes,
                "connected_likes": connected_likes,
                "not_connected_likes": not_connected_likes
            }
        except Exception as e:
            raise Exception(f"Error getting likes statistics: {str(e)}")

    async def get_users_who_liked_me(
        self, 
        user_id: str, 
        page: int = 1, 
        items_per_page: int = 10,
        connection_status: Optional[bool] = None
    ):
        """
        Get all users who have liked the current user, including their profile information
        Optional filtering by connection status (connected or not connected)
        Excludes users who have blocked the current user
        """
        offset = (page - 1) * items_per_page
        
        where_clause = "l.liked = :user_id"
        params = {
            "user_id": user_id
        }
        
        if connection_status is not None:
            where_clause += " AND l.is_connected = :is_connected"
            params["is_connected"] = connection_status
        
        # Add condition to exclude users who have blocked the current user
        where_clause += " AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker = l.liker AND b.blocked = :user_id)"
        
        count_query = f"""
            SELECT COUNT(*) 
            FROM likes l
            WHERE {where_clause}
        """

        query = f"""
            SELECT u.id, u.username, u.first_name, u.last_name, 
                   u.gender, u.profile_picture, u.fame_rating, u.age, u.bio,
                   l.is_connected, l.like_time
            FROM likes l
            JOIN users u ON l.liker = u.id
            WHERE {where_clause}
            ORDER BY l.like_time DESC
            LIMIT {items_per_page} OFFSET {offset}
        """
        
        total_count = await self.db.fetch_val(count_query, params)
        results = await self.db.fetch_all(query, params)
        
        return {
            "total": total_count,
            "page": page,
            "items_per_page": items_per_page,
            "users": results
        }

    async def remove_like(self, liker_id: str, liked_id: str) -> bool:
        """Remove a like from one user to another"""
        try:
            query = """
                DELETE FROM likes
                WHERE liker = :liker_id AND liked = :liked_id
                RETURNING id
            """
            result = await self.db.fetch_one(query, {"liker_id": liker_id, "liked_id": liked_id})
            return result is not None
        except Exception as e:
            raise Exception(f"Error removing like: {str(e)}")