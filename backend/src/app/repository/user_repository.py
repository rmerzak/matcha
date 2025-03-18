from app.repository.base_repository import BaseRepository
from app.schemas.users import UserCreateInternal, ProfileUpdate
from typing import List
from app.core.db.database import DatabaseError

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
            query = """
                SELECT id, username, first_name, last_name, email, gender, 
                    sexual_preferences, interests, pictures, profile_picture, fame_rating, 
                    location, latitude, address, age, bio
                FROM users 
                WHERE id = :user_id
            """
            result = await self.fetch_one(query=query, values={"user_id": user_id})
            return dict(result) if result else None
        except Exception as e:
            raise DatabaseError(f"Failed to fetch user by id: {str(e)}")
            


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
    
    # async def update_profile(
    #     self, 
    #     profile_data: ProfileUpdate, 
    #     email: str,
    #     profile_picture_url: str, 
    #     additional_pictures_urls: List[str]
    #     ):
    #     try:
    #         # Ensure interests is a list
    #         interests_list = profile_data.interests if profile_data.interests else []

    #         # # Ensure profile_picture_url and additional_pictures_urls are lists
    #         # profile_picture_urls = [profile_picture_url] if profile_picture_url else []
    #         additional_pictures_urls = additional_pictures_urls or []
    #         values = {
    #             "gender": profile_data.gender,
    #             "first_name": profile_data.first_name,
    #             "last_name": profile_data.last_name,
    #             "profile_picture": profile_picture_url,
    #             "sexual_preferences": profile_data.sexual_preferences,
    #             "bio": profile_data.bio,
    #             "interests": interests_list,
    #             "pictures": additional_pictures_urls,
    #             "updated_email": profile_data.email,
    #             "email": email 
    #         }
    #         print("values ==",values)
        
    #         result = await self.execute(query="""
    #             UPDATE users  SET 
    #                 gender = :gender,
    #                 sexual_preferences = :sexual_preferences,
    #                 first_name = :first_name,
    #                 last_name = :last_name,
    #                 email = :updated_email,
    #                 bio = :bio,
    #                 profile_picture = :profile_picture,
    #                 pictures = :pictures,
    #                 interests = :interests,
    #                 updated_at = CURRENT_TIMESTAMP
    #             WHERE email = :email
    #             RETURNING username, email, first_name, last_name, gender, sexual_preferences, bio, interests, pictures;
    #         """, values=values)
            
    #         # Ensure the result is not None
    #         if not result:
    #             return {"error": "No rows were updated"}
            
    #         return {"result":"ggg"}
    #     except Exception as e:
    #         print(e)
    #         return {"error": f"An error occurred while updating profile: {str(e)}"}
    

    async def update_profile(
        self, 
        profile_data: ProfileUpdate, 
        email: str,
        profile_picture_url: str, 
        additional_pictures_urls: List[str]
    ):
        try:
            values = {"email": email}
            
            update_fields = []
            
            field_mapping = {
                "gender": profile_data.gender,
                "first_name": profile_data.first_name,
                "last_name": profile_data.last_name,
                "profile_picture": profile_picture_url,
                "sexual_preferences": profile_data.sexual_preferences,
                "bio": profile_data.bio,
                "interests": profile_data.interests if profile_data.interests else None,
                "pictures": additional_pictures_urls if additional_pictures_urls else None,
                "email": profile_data.email  # For the updated_email field
            }
            
            for field, value in field_mapping.items():
                if value is not None:
                    if field == "email":
                        values["updated_email"] = value
                        update_fields.append("email = :updated_email")
                    else:
                        values[field] = value
                        update_fields.append(f"{field} = :{field}")
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            
            if len(update_fields) <= 1:
                return await self.get_user_by_email(email)
                
            query = f"""
                UPDATE users 
                SET {', '.join(update_fields)}
                WHERE email = :email
                RETURNING username, email, first_name, last_name, gender, 
                        sexual_preferences, bio, interests, pictures;
            """
            
            result = await self.execute(query=query, values=values)
            return result
            
        except Exception as e:
            raise DatabaseError(f"Failed to update profile: {str(e)}")
    async def close_session(self):
        await self.db.disconnect()

    async def search_users(
        self,
        age_min: int = None,
        age_max: int = None,
        fame_min: float = None,
        fame_max: float = None,
        common_tags: List[str] = None,
        sort_by: str = None,
        sort_order: str = "asc"
    ):
        try:
            conditions = ["1=1"]
            values = {}
            
            if age_min is not None:
                conditions.append("age >= :age_min")
                values["age_min"] = age_min
            
            if age_max is not None:
                conditions.append("age <= :age_max")
                values["age_max"] = age_max
            
            if fame_min is not None:
                conditions.append("fame_rating >= :fame_min")
                values["fame_min"] = fame_min
            
            if fame_max is not None:
                conditions.append("fame_rating <= :fame_max")
                values["fame_max"] = fame_max
            
            if common_tags and len(common_tags) > 0:
                conditions.append("interests && :common_tags")
                values["common_tags"] = common_tags

            order_clause = ""
            if sort_by:
                order_clause = f" ORDER BY {sort_by} {sort_order}"

            query = f"""
                SELECT id, username, first_name, last_name, email, gender, 
                    sexual_preferences, interests, pictures, profile_picture, fame_rating, 
                    location, latitude, address, age, bio
                FROM users 
                WHERE {' AND '.join(conditions)}
                {order_clause}
            """
            
            results = await self.fetch_all(query=query, values=values)
            return [dict(row) for row in results]
            
        except Exception as e:
            raise DatabaseError(f"Failed to search users: {str(e)}")

    async def search_users_by_username(self, username_prefix: str):
        try:
            query = """
                SELECT id, username, first_name, last_name, email, gender, 
                    sexual_preferences, interests, pictures, profile_picture, fame_rating, 
                    location, latitude, address, age, bio
                FROM users 
                WHERE username ILIKE :username_prefix
                ORDER BY username ASC
            """
            
            results = await self.fetch_all(
                query=query, 
                values={"username_prefix": f"{username_prefix}%"}
            )
            return [dict(row) for row in results]
            
        except Exception as e:
            raise DatabaseError(f"Failed to search users by username: {str(e)}")