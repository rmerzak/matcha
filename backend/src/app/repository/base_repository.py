from app.core.db.database import handle_database_errors, map_database_error
class BaseRepository:
    def __init__(self, db):
        self.db = db
    async def fetch_all(self, query: str, values: dict = None):
        return await self.db.fetch_all(query=query, values=values)
    async def fetch_one(self, query: str, values: dict = None):
        return await self.db.fetch_one(query=query, values=values)

    async def execute(self, query: str, values: dict = None):
        return await self.db.execute(query=query, values=values)

    async def execute_many(self, queries: list):
        async with self.db.transaction():
            for query, values in queries:
                await self.db.execute(query=query, values=values)