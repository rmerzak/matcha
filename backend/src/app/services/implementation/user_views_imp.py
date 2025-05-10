from app.services.base_service import BaseService
from fastapi import UploadFile, File
from typing import List
from app.core.responce import error_response, success_response
from app.repository.user_views_repository import UserViewsRepository
from app.repository.user_repository import UserRepository
from app.services.user_views_interface import IUserViewsService
from app.services.socketio_manager_interface import ISocketIOManager
from app.repository.blocks_repository import BlocksRepository
class UserViewsServiceImp(BaseService, IUserViewsService):
    def __init__(self, user_views_repository: UserViewsRepository, user_repository: UserRepository, socketio_manager: ISocketIOManager, blocks_repository: BlocksRepository):
        self.user_views_repository = user_views_repository
        self.user_repository = user_repository
        self.socketio_manager = socketio_manager
        self.blocks_repository = blocks_repository
    async def add_view(self, viewed: str, viewer_id: str):
        try:
            print(viewed, viewer_id)
            if viewed == viewer_id:
                return error_response("Invalid data", "You cannot view yourself", status_code=400)
            user = await self.user_repository.get_user_by_id(viewed)
            print("user", user)
            if not user:
                return error_response("Invalid data", "User does not exist", status_code=400)
            
            # Check if there's a recent view within the last 30 seconds
            recent_view = await self.user_views_repository.get_recent_view(viewed, viewer_id)
            if recent_view:
                return success_response(
                    {"viewed": viewed, "viewer": viewer_id},
                    "View already recorded in the last 30 seconds", 
                    status_code=200
                )
            
            cleaned_viewed = str(viewed).replace('UUID(\'', '').replace('\')', '')
            cleaned_viewer_id = str(viewer_id).replace('UUID(\'', '').replace('\')', '')
            await self.socketio_manager.send_event("view", {"viewed": cleaned_viewed, "viewer": cleaned_viewer_id}, cleaned_viewed)
            await self.user_views_repository.add_view(viewed, viewer_id)
            return success_response({"viewed": viewed, "viewer": viewer_id},"View added successfully", status_code=200)
        except Exception as e:
            return error_response("Internal server error", 'An error occurred while adding view', status_code=500, details={"error": str(e)})
    async def get_my_views(self, user_id: str, page: int = 1, item_per_page: int = 10):
        try:
            result = await self.user_views_repository.get_my_views(user_id, page, item_per_page)
            return success_response(
                result,
                "Views retrieved successfully",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error",
                "An error occurred while retrieving views",
                status_code=500,
                details={"error": str(e)}
            )
    async def close_scoped_session(self):
        await self.user_views_repository.close_session()