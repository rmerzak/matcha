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