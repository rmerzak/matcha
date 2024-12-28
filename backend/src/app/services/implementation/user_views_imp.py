from app.services.base_service import BaseService
from fastapi import UploadFile, File
from typing import List
from app.core.responce import error_response, success_response
from app.repository.user_views_repository import UserViewsRepository
from app.repository.user_repository import UserRepository
from app.services.user_views_interface import IUserViewsService


class UserViewsServiceImp(BaseService, IUserViewsService):
    def __init__(self, user_views_repository: UserViewsRepository, user_repository: UserRepository):
        self.user_views_repository = user_views_repository
        self.user_repository = user_repository
    async def add_view(self, viewed: str, viewer_id: str):
        try:
            print(viewed, viewer_id)
            user = await self.user_repository.get_user_by_id(viewed)
            # print(user)
            if not user:
                return error_response("Invalid data", "User does not exist", status_code=400)
            # result = await self.user_views_repository.add_view(viewed, viewer_id)
            # return success_response("View added successfully", result, status_code=200)
        except Exception as e:
            raise e
    async def close_scoped_session(self):
        await self.user_views_repository.close_session()