from datetime import datetime

from app.core.db.dbinit import database

async def get_all_users():
    query = "SELECT * FROM users;"

    data = await database.fetch_all(query)

    return [{**i} for i in data]