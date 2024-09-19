from datetime import datetime

from app.core.db.dbinit import database

async def get_all_users():
    query = "SELECT * FROM users;"

    data = await database.fetch_all(query)

    return [{**i} for i in data]

async def get_user_by_email(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    print(query)

    data = await database.fetch_one(query=query, values={"email": email})
    return {**data} if data else None
