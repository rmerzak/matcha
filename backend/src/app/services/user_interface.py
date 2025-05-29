from abc import ABC, abstractmethod
from fastapi import Response
from app.schemas.users import ProfileUpdate, UserSearchParams
from fastapi import UploadFile, File
from typing import List

class IUserService(ABC):
    @abstractmethod
    async def update_profile(self, profile_data: ProfileUpdate, email: str, profile_picture: UploadFile | str = File(...), additional_pictures: List[UploadFile] | List[str] = File([])):
        pass
    @abstractmethod
    async def close_scoped_session():
        pass
    @abstractmethod
    async def search_users(self, search_params: UserSearchParams):
        pass
    @abstractmethod
    async def search_users_by_username(self, username: str):
        pass
    @abstractmethod
    async def get_user_by_id(self, user_id: str):
        pass
    @abstractmethod
    async def get_user_by_id_data(self, user_id: str):
        pass
    @abstractmethod
    async def browse_profiles(self, user_id, min_age, max_age, max_distance, min_fame, max_fame, sort_by, sort_order):
        pass