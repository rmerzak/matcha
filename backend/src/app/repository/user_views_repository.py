from app.repository.base_repository import BaseRepository
from typing import List

class UserViewsRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db
    async def add_view(self, viewed: str, viewer_id: str):
        try:
            query = """
                INSERT INTO views (viewed, viewer)
                VALUES (:viewed, :viewer)
                RETURNING id;
            """
            values = {
                "viewed": viewed,
                "viewer": viewer_id
            }
            return await self.execute(query=query, values=values)
        except Exception as e:
            raise e

    async def get_my_views(self, user_id: str):
        try:
            query = """
                SELECT v.id, v.viewer, v.viewed, v.view_time, 
                    u.username as viewer_username, u.profile_picture as viewer_profile_picture
                FROM views v
                JOIN users u ON v.viewer = u.id
                WHERE v.viewed = :user_id
                ORDER BY v.view_time DESC;
            """            
            count_query = """
                SELECT COUNT(*) as total
                FROM views
                WHERE viewed = :user_id;
            """
            
            values = {"user_id": user_id}
            
            views_records = await self.fetch_all(query=query, values=values)
            total_count = await self.fetch_one(query=count_query, values={"user_id": user_id})            
            views = []
            for record in views_records:
                view_dict = dict(record)
                if 'id' in view_dict:
                    view_dict['id'] = str(view_dict['id'])
                if 'viewer' in view_dict:
                    view_dict['viewer'] = str(view_dict['viewer'])
                if 'viewed' in view_dict:
                    view_dict['viewed'] = str(view_dict['viewed'])
                if 'view_time' in view_dict:
                    view_dict['view_time'] = view_dict['view_time'].isoformat()
                views.append(view_dict)
            
            return {
                "result": views,
                "total": total_count["total"]
            }
        except Exception as e:
            raise e

    async def get_recent_view(self, viewed: str, viewer_id: str, seconds: int = 30):
        try:
            query = """
                SELECT id 
                FROM views 
                WHERE viewed = :viewed 
                AND viewer = :viewer 
                AND view_time > NOW() - (INTERVAL '1 second' * :seconds)
                ORDER BY view_time DESC
                LIMIT 1;
            """
            values = {
                "viewed": viewed,
                "viewer": viewer_id,
                "seconds": seconds
            }
            return await self.fetch_one(query=query, values=values)
        except Exception as e:
            raise e