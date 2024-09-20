from datetime import datetime

from app.core.db.dbinit import database
from app.schemas.users import UserCreateInternal
import asyncpg
import uuid
async def get_all_users():
    query = "SELECT * FROM users;"

    data = await database.fetch_all(query)

    return [{**i} for i in data]

async def get_user_by_email(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    print(query)

    data = await database.fetch_one(query=query, values={"email": email})
    return {**data} if data else None

async def get_user_by_username(username: str):
    query = "SELECT * FROM users WHERE username = :username"

    data = await database.fetch_one(query=query, values={"username": username})
    return {**data} if data else None

async def create_user_internal(user:UserCreateInternal):
    query = "INSERT INTO users (username, email, password, first_name, last_name) VALUES (:username, :email, :password, :first_name, :last_name) RETURNING username, email, first_name, last_name;"
    values = {
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    ## execute return a tuple of the data but fetch_one return a dictionary
    # data = await database.execute(query=query, values=values)
    data = await database.fetch_one(query=query, values=values)
    return {**data} if data else None
