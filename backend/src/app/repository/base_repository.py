from app.core.db.dbinit import database

class BaseRepository:
    def __init__(self):
        self.db = database
    
    async def connect(self):
        await self.db.connect()
    async def close_scoped_session(self):
        await self.db.disconnect()

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