from app.services.base_service import BaseService
from fastapi import UploadFile, File
from typing import List, Optional
from app.core.responce import error_response, success_response
from app.repository.user_views_repository import UserViewsRepository
from app.repository.user_repository import UserRepository
from app.repository.likes_repository import LikesRepository
from app.services.user_views_interface import IUserViewsService
from app.services.socketio_manager_interface import ISocketIOManager
from app.services.likes_interface import ILikesService

class LikesServiceImp(BaseService, ILikesService):
    def __init__(self, user_repository: UserRepository, socketio_manager: ISocketIOManager, likes_repository: LikesRepository):
        self.user_repository = user_repository
        self.socketio_manager = socketio_manager
        self.likes_repository = likes_repository
    async def add_like(self, user_id: str, liked_user_id: str):
        try:
            liker = await self.user_repository.get_user_by_id(user_id)
            liked = await self.user_repository.get_user_by_id(liked_user_id)
            if not liker or not liked:
                return error_response("Not found", "One or both users do not exist", status_code=404)
            if user_id == liked_user_id:
                return error_response("Invalid operation", "Users cannot like themselves", status_code=400)
            new_like = await self.likes_repository.add_like(user_id, liked_user_id)
            if not new_like:
                return success_response("Already liked", "You have already liked this user")

            mutual_like = await self.likes_repository.check_mutual_like(user_id, liked_user_id)
            if mutual_like:
                await self.likes_repository.update_connection_status(user_id, liked_user_id)
                return success_response(
                    data={"is_match": True, "liked_user_id": liked_user_id},
                    message="Match created",
                    status_code=200
                )
            return success_response(
                data={"is_match": False, "liked_user_id": liked_user_id},
                message="Like added",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error", 
                'An error occurred while adding like', 
                status_code=500, 
                details={"error": str(e)}
            )

    async def get_like_status(self, user_id: str, other_user_id: str):
        try:
            current_user = await self.user_repository.get_user_by_id(user_id)
            other_user = await self.user_repository.get_user_by_id(other_user_id)
            if not current_user or not other_user:
                return error_response("Not found", "One or both users do not exist", status_code=404)
            
            like_exists = await self.likes_repository.check_like_exists(other_user_id, user_id)
            
            mutual_like = await self.likes_repository.check_mutual_like(user_id, other_user_id)
            
            is_connected = False
            if mutual_like:
                is_connected = await self.likes_repository.check_connection_status(user_id, other_user_id)
                
            return success_response(
                data={
                    "is_liked_by_other": like_exists,
                    "is_mutual": mutual_like,
                    "is_connected": is_connected,
                    "other_user_id": other_user_id
                },
                message="Like status retrieved successfully",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error", 
                'An error occurred while getting like status', 
                status_code=500, 
                details={"error": str(e)}
            )

    async def get_likes_statistics(self, user_id: str):
        try:
            user = await self.user_repository.get_user_by_id(user_id)
            if not user:
                return error_response("Not found", "User does not exist", status_code=404)
            
            stats = await self.likes_repository.get_likes_statistics(user_id)
            
            return success_response(
                data=stats,
                message="Likes statistics retrieved successfully",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error", 
                'An error occurred while getting likes statistics', 
                status_code=500, 
                details={"error": str(e)}
            )

    async def get_users_who_liked_me(
        self, 
        user_id: str, 
        page: int = 1, 
        items_per_page: int = 10,
        connection_status: Optional[bool] = None
    ):
        try:
            user = await self.user_repository.get_user_by_id(user_id)
            if not user:
                return error_response("Not found", "User does not exist", status_code=404)
            
            likes_data = await self.likes_repository.get_users_who_liked_me(
                user_id, 
                page, 
                items_per_page,
                connection_status
            )
            
            total = likes_data["total"]
            has_more = total > (page * items_per_page)
            
            formatted_users = []
            for user in likes_data["users"]:
                user_dict = dict(user)
                if "like_time" in user_dict and user_dict["like_time"]:
                    user_dict["like_time"] = user_dict["like_time"].isoformat()
                formatted_users.append(user_dict)
            
            return success_response(
                data={
                    "total": likes_data["total"],
                    "page": likes_data["page"],
                    "items_per_page": likes_data["items_per_page"],
                    "has_more": has_more,
                    "users": formatted_users,
                    "connection_filter": connection_status
                },
                message="Users who liked you retrieved successfully",
                status_code=200
            )
        except Exception as e:
            return error_response(
                "Internal server error", 
                'An error occurred while getting users who liked you', 
                status_code=500, 
                details={"error": str(e)}
            )
