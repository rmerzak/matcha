from app.repository.user_repository import UserRepository
from app.services.base_service import BaseService
from app.services.user_interface import IUserService
from app.schemas.users import ProfileUpdate
from fastapi import UploadFile, File
from typing import List
from app.core.responce import error_response, success_response
from app.services.cloudinary_service import CloudinaryService


class UserServiceImp(BaseService, IUserService):
    def __init__(self, user_repository: UserRepository,cloudinary_service: CloudinaryService):
        self.user_repository = user_repository
        self.cloudinary_service = cloudinary_service
    
    async def close_scoped_session(self):
        await self.user_repository.close_session()
    
    async def update_profile(self, 
        profile_data: ProfileUpdate, 
        email: str,
        profile_picture: UploadFile = File(...), 
        additional_pictures: List[UploadFile] = File([]),
        ):
        try:
            if len(additional_pictures) > 4:
                return error_response("Invalid data", "You can only upload 4 additional pictures", status_code=400)
            
            # Handle case where no profile picture is uploaded
            profile_picture_url = None
            if profile_picture:
                profile_picture_url = await self.cloudinary_service.upload_image(profile_picture)
            
            additional_pictures_urls = []
            for picture in additional_pictures:
                additional_pictures_urls.append(await self.cloudinary_service.upload_image(picture))
            
            result = await self.user_repository.update_profile(
                profile_data, 
                email, 
                profile_picture_url, 
                additional_pictures_urls
            )
            
            # Check if result has an error key
            if isinstance(result, dict) and 'error' in result:
                return error_response("Update Failed", result['error'], status_code=500)
            
            return success_response("Profile updated successfully", result, status_code=200)
        
        except Exception as e:
            return error_response("An error occurred", str(e), status_code=500)
    
