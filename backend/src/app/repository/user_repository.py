

from app.repository.base_repository import BaseRepository
from app.schemas.users import UserCreateInternal

class UserRepository(BaseRepository):
    def __init__(self, db):
        super().__init__()
        self.db = db


    async def get_all_users(self):
        await self.db.connect()
        query = "SELECT * FROM users;"
        print(query)
        return await self.fetch_all(query)

    async def get_user_by_email(self, email: str):
        query = "SELECT * FROM users WHERE email = :email"
        return await self.fetch_one(query=query, values={"email": email})

    async def get_user_by_username(self, username: str):
        query = "SELECT * FROM users WHERE username = :username"
        return await self.fetch_one(query=query, values={"username": username})

    async def create_user_internal(self, user: UserCreateInternal):
        query = """
            INSERT INTO users (username, email, password, first_name, last_name) 
            VALUES (:username, :email, :password, :first_name, :last_name) 
            RETURNING username, email, first_name, last_name;
        """
        values = {
            "username": user.username,
            "email": user.email,
            "password": user.password,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        return await self.fetch_one(query=query, values=values)

    async def update_user_verification(self, email: str):
        query = """
            UPDATE users 
            SET is_verified = TRUE 
            WHERE email = :email 
            RETURNING username, email, first_name, last_name;
        """
        return await self.execute(query=query, values={"email": email})