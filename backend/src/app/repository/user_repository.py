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
                    location, latitude, longitude, address, age, bio, is_verified
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
                "email": profile_data.email,  # For the updated_email field
                "date_of_birth": profile_data.date_of_birth,  # Add date_of_birth
                "location": profile_data.location,  # Add location
                "latitude": profile_data.latitude,  # Add latitude
                "longitude": profile_data.longitude,  # Add longitude
                "address": profile_data.address  # Add address
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
                        sexual_preferences, bio, interests, pictures, date_of_birth,
                        location, latitude, longitude, address;
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

    async def get_matching_profiles(
        self,
        user_id: str,
        page: int = 1,
        items_per_page: int = 10,
        min_age: int = None,
        max_age: int = None,
        max_distance: int = None,
        min_fame: int = None,
        max_fame: int = None,
        min_tags: int = None,
        sort_by: str = None,
        sort_order: str = "desc"
    ):
        try:
            user_query = """
                SELECT id, gender, sexual_preferences, interests, latitude, longitude, location
                FROM users
                WHERE id = :user_id
            """
            current_user = await self.fetch_one(query=user_query, values={"user_id": user_id})
            print("Current user data retrieved")
            if not current_user:
                raise DatabaseError("User not found")
            conditions = ["users.id != :user_id"]
            values = {"user_id": user_id, "offset": (page - 1) * items_per_page, "limit": items_per_page}
            gender = current_user["gender"]
            preference = current_user["sexual_preferences"] or "bisexual"
            if preference == "heterosexual":
                if gender == "male":
                    conditions.append("gender = 'female'")
                elif gender == "female":
                    conditions.append("gender = 'male'")
            elif preference == "homosexual":
                if gender:
                    conditions.append(f"gender = '{gender}'")
            if min_age is not None:
                conditions.append("age >= :min_age")
                values["min_age"] = min_age
            if max_age is not None:
                conditions.append("age <= :max_age")
                values["max_age"] = max_age
            if min_fame is not None:
                conditions.append("fame_rating >= :min_fame")
                values["min_fame"] = min_fame
            if max_fame is not None:
                conditions.append("fame_rating <= :max_fame")
                values["max_fame"] = max_fame
            user_interests = current_user["interests"] or []
            has_interests = len(user_interests) > 0
            has_location = False
            distance_expr = "NULL as distance_km"
            if current_user["latitude"] is not None and current_user["longitude"] is not None:
                has_location = True
                values["user_lat"] = current_user["latitude"]
                values["user_long"] = current_user["longitude"]
                distance_expr = """
                    CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL
                        THEN sqrt(power(69.1 * (latitude - :user_lat), 2) + 
                            power(69.1 * (:user_long - longitude) * cos(latitude / 57.3), 2))
                        ELSE NULL
                    END as distance_km
                """
                if max_distance is not None:
                    conditions.append("""
                        (latitude IS NOT NULL AND longitude IS NOT NULL AND
                        sqrt(power(69.1 * (latitude - :user_lat), 2) + 
                        power(69.1 * (:user_long - longitude) * cos(latitude / 57.3), 2)) <= :max_distance)
                    """)
                    values["max_distance"] = max_distance
            if sort_by == "age":
                order_clause = f"ORDER BY age {sort_order}"
            elif sort_by == "fame_rating":
                order_clause = f"ORDER BY fame_rating {sort_order}"
            elif sort_by == "common_tags":
                order_clause = "ORDER BY fame_rating DESC"
            elif sort_by == "distance" and has_location:
                order_clause = f"ORDER BY distance_km {sort_order}"
            else:
                if has_location:
                    order_clause = "ORDER BY distance_km ASC, fame_rating DESC"
                else:
                    order_clause = "ORDER BY fame_rating DESC"
            query = f"""
                SELECT
                    id, username, first_name, last_name, gender,
                    sexual_preferences, interests, pictures, profile_picture, fame_rating,
                    location, latitude, longitude, age, bio,
                    {distance_expr}
                FROM users
                WHERE {' AND '.join(conditions)}
                {order_clause}
                LIMIT :limit OFFSET :offset
            """
            print("Query built successfully")
            count_query = f"""
                SELECT COUNT(*) as total
                FROM users
                WHERE {' AND '.join(conditions)}
            """
            total_count = 0
            try:
                total_result = await self.fetch_one(query=count_query, values=values)
                if total_result and "total" in total_result:
                    total_count = total_result["total"]
                print("Total count:", total_count)
            except Exception as e:
                print("Error in count query:", str(e))
            try:
                results = await self.fetch_all(query=query, values=values)
                print("Found profiles:", len(results))
                profiles = []
                for row in results:
                    profile = dict(row)
                    if has_interests:
                        profile_interests = profile.get("interests", []) or []
                        common = set(user_interests).intersection(set(profile_interests))
                        profile["common_tag_count"] = len(common)
                        profile["common_tags"] = list(common)
                    else:
                        profile["common_tag_count"] = 0
                        profile["common_tags"] = []
                    profiles.append(profile)
                if sort_by == "common_tags":
                    reverse_sort = sort_order.lower() == "desc"
                    profiles = sorted(profiles, key=lambda x: x.get("common_tag_count", 0), reverse=reverse_sort)
                if min_tags is not None and min_tags > 0:
                    profiles = [p for p in profiles if p.get("common_tag_count", 0) >= min_tags]
                    filtered_count = len(profiles)
                    start_idx = (page - 1) * items_per_page
                    end_idx = start_idx + items_per_page
                    profiles = profiles[start_idx:end_idx]
                    total_count = filtered_count
                return {
                    "profiles": profiles,
                    "total": total_count,
                    "page": page,
                    "items_per_page": items_per_page,
                    "pages": (total_count // items_per_page) + (1 if total_count % items_per_page > 0 else 0)
                }
            except Exception as e:
                print("Error in main query:", str(e))
                raise DatabaseError(f"Failed to execute query: {str(e)}")
        except Exception as e:
            print("Error in get_matching_profiles:", str(e))
            raise DatabaseError(f"Failed to find matching profiles: {str(e)}")

    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        from math import radians, cos, sin, asin, sqrt
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371
        return c * r