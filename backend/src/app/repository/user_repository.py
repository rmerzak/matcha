

from app.repository.base_repository import BaseRepository
from app.schemas.users import UserCreateInternal, ProfileUpdate
from typing import List

class UserRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db

    async def get_all_users(self):
        query = "SELECT * FROM users;"
        print(query)
        return await self.fetch_all(query)

    async def get_user_by_email(self, email: str):
        try:
            query = """
                SELECT id, username, first_name, last_name, email, gender, 
                    sexual_preferences, interests, pictures, profile_picture, fame_rating, 
                    location, latitude, address, age, bio, is_verified
                FROM users 
                WHERE email = :email
            """
            return await self.fetch_one(query=query, values={"email": email})
        except Exception as e:
            return {"error": "An error occurred while fetching user by email: " + str(e)}

    async def get_user_by_id(self, user_id: str):
        try:
            print(user_id)
            query = """
                SELECT username, first_name, last_name, email
                FROM users 
                WHERE id = :user_id
            """
            return await self.fetch_one(query=query, values={"user_id": user_id})
        except Exception as e:
            return {"error": "An error occurred while fetching user by id" + str(e)}
            


    async def get_user_by_username(self, username: str):
        try:
            query = "SELECT * FROM users WHERE username = :username"
            return await self.fetch_one(query=query, values={"username": username})
        except Exception as e:
            return {"error": "An error occurred while fetching user by username" + str(e)}

    async def create_user_internal(self, user: UserCreateInternal):
        try:
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
        except Exception as e:
            return {"error": "An error occurred while creating user" + str(e)}

    async def update_user_verification(self, email: str):
        try:
            query = """
                UPDATE users 
                SET is_verified = TRUE 
                WHERE email = :email 
                RETURNING username, email, first_name, last_name;
            """
            return await self.execute(query=query, values={"email": email})
        except Exception as e:
            return {"error": "An error occurred while updating user verification status" + str(e)}
    async def update_user_password(self, email: str, password: str):
        try:
            query = """
                UPDATE users 
                SET password = :password 
                WHERE email = :email 
                RETURNING username, email, first_name, last_name;
            """
            return await self.execute(query=query, values={"email": email, "password": password})
        except Exception as e:
            return {"error": "An error occurred while updating user password" + str(e)}
    async def update_profile(
        self, 
        profile_data: ProfileUpdate, 
        email: str,
        profile_picture_url: str, 
        additional_pictures_urls: List[str]
        ):
        try:
            # Ensure interests is a list
            interests_list = profile_data.interests if profile_data.interests else []

            # # Ensure profile_picture_url and additional_pictures_urls are lists
            # profile_picture_urls = [profile_picture_url] if profile_picture_url else []
            additional_pictures_urls = additional_pictures_urls or []

            values = {
                "gender": profile_data.gender,
                "profile_picture": profile_picture_url or None,
                "sexual_preferences": profile_data.sexual_preferences,
                "bio": profile_data.bio,
                "interests": interests_list,
                "pictures": additional_pictures_urls,
                "email": email
            }
        
            result = await self.execute(query="""
                UPDATE users  SET 
                    gender = :gender,
                    sexual_preferences = :sexual_preferences,
                    bio = :bio,
                    profile_picture = :profile_picture,
                    pictures = :pictures,
                    interests = :interests,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = :email
                RETURNING username, email, first_name, last_name, gender, sexual_preferences, bio, interests, pictures;
            """, values=values)
            
            # Ensure the result is not None
            if not result:
                return {"error": "No rows were updated"}
            
            return result
        except Exception as e:
            print(e)
            return {"error": f"An error occurred while updating profile: {str(e)}"}
    async def close_session(self):
        await self.db.disconnect()