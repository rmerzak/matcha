from app.repository.user_repository import UserRepository
from app.services.base_service import BaseService
from app.services.user_interface import IUserService
from app.schemas.users import ProfileUpdate, UserSearchParams
from fastapi import UploadFile, File
from typing import Optional
from typing import List
from app.core.responce import error_response, success_response
from app.services.cloudinary_service import CloudinaryService
from app.repository.blocks_repository import BlocksRepository

class UserServiceImp(BaseService, IUserService):
    def __init__(self, user_repository: UserRepository,cloudinary_service: CloudinaryService, blocks_repository: BlocksRepository):
        self.user_repository = user_repository
        self.cloudinary_service = cloudinary_service
        self.blocks_repository = blocks_repository
    
    async def close_scoped_session(self):
        await self.user_repository.close_session()
    
    async def update_profile(self, 
        profile_data: ProfileUpdate, 
        email: str,
        profile_picture: Optional[UploadFile] = None,
        additional_pictures: List[UploadFile] = File([]),
        ):
        try:
            if len(additional_pictures) > 4:
                return error_response("Invalid data", "You can only upload 4 additional pictures", status_code=400)
            
            profile_picture_url = None
            print("profile_picture 0", (hasattr(profile_data, 'profile_picture') and 
                                         profile_data.profile_picture == ""), profile_picture is None)
            if (hasattr(profile_data, 'profile_picture') and 
                                         profile_data.profile_picture == ""):
                print("profile_picture 2")
                profile_picture_url = ""
            elif profile_picture:
                print("profile_picture 1")
                profile_picture_url = await self.cloudinary_service.upload_image(profile_picture)
            
            additional_pictures_urls = []
            for picture in additional_pictures:
                additional_pictures_urls.append(await self.cloudinary_service.upload_image(picture))
            print("additional_pictures_urls" ,profile_picture_url)
            result = await self.user_repository.update_profile(
                profile_data, 
                email, 
                profile_picture_url, 
                additional_pictures_urls
            )
            
            if isinstance(result, dict) and 'error' in result:
                return error_response("Update Failed", result['error'], status_code=500)
            
            return success_response("Profile updated successfully", result, status_code=200)
        
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    async def search_users(self, search_params: UserSearchParams, current_user_id: str):
        try:
            result = await self.user_repository.search_users(
                current_user_id=current_user_id,
                age_min=search_params.age_min,
                age_max=search_params.age_max,
                fame_min=search_params.fame_min,
                fame_max=search_params.fame_max,
                common_tags=search_params.common_tags,
                sort_by=search_params.sort_by.value if search_params.sort_by else None,
                sort_order=search_params.sort_order.value if search_params.sort_order else "asc"
            )
            
            if isinstance(result, dict) and 'error' in result:
                return error_response("Search Failed", result['error'], status_code=500)
            
            return success_response(
                message="Users retrieved successfully",
                data={
                    "users": result,
                    "count": len(result)
                },
                status_code=200
            )
            
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    
    async def search_users_by_username(self, username: str, current_user_id: str):
        try:
            result = await self.user_repository.search_users_by_username(username, current_user_id)
            
            if isinstance(result, dict) and 'error' in result:
                return error_response("Search Failed", result['error'], status_code=500)
            
            return success_response(
                message="Users retrieved successfully",
                data={
                    "users": result,
                    "count": len(result)
                },
                status_code=200
            )
            
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    
    async def get_user_by_id(self, user_id: str):
        try:
            result = await self.user_repository.get_user_by_id(user_id)
            
            if not result:
                return error_response("Not Found", "User not found", status_code=404)
            
            return success_response(
                message="User retrieved successfully",
                data=result,
                status_code=200
            )
            
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    
    async def get_user_by_id_data(self, user_id: str):
        try:
            return await self.user_repository.get_user_by_id(user_id)
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    async def browse_profiles(
        self,
        user_id: str,
        min_age: int = None,
        max_age: int = None,
        max_distance: int = None,
        min_fame: int = None,
        max_fame: int = None,
        common_tags: List[str] = None,
        sort_by: str = None,
        sort_order: str = "desc"
    ):
        try:
            result = await self.user_repository.get_matching_profiles(
                user_id=user_id,
                min_age=min_age,
                max_age=max_age,
                max_distance=max_distance,
                min_fame=min_fame,
                max_fame=max_fame,
                common_tags=common_tags or [],
                sort_by=sort_by,
                sort_order=sort_order
            )
            
            return success_response(
                message="Matching profiles retrieved successfully",
                data=result,
                status_code=200
            )
            
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    
