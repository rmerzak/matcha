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
from app.repository.blocks_repository import BlocksRepository
class LikesServiceImp(BaseService, ILikesService):
    def __init__(self, user_repository: UserRepository, socketio_manager: ISocketIOManager, likes_repository: LikesRepository, blocks_repository: BlocksRepository):
        self.user_repository = user_repository
        self.socketio_manager = socketio_manager
        self.likes_repository = likes_repository
        self.blocks_repository = blocks_repository
    async def add_like(self, user_id: str, liked_user_id: str):
        try:
            # Get both users
            liker = await self.user_repository.get_user_by_id(user_id)
            liked = await self.user_repository.get_user_by_id(liked_user_id)
            
            # Check if both users exist
            if not liker or not liked:
                return error_response("Not found", "One or both users do not exist", status_code=404)

            if str(user_id) == str(liked_user_id):
                return error_response("Invalid operation", "Users cannot like themselves", status_code=400)
            
            # Check if liker has a profile picture
            if not liker.get("profile_picture"):
                return error_response(
                    "Profile incomplete", 
                    "You need to add a profile picture before liking other users", 
                    status_code=400
                )
            
            # Add the like
            new_like = await self.likes_repository.add_like(user_id, liked_user_id)
            if not new_like:
                return success_response("Already liked", "You have already liked this user")

            # Check for mutual like (match)
            mutual_like = await self.likes_repository.check_mutual_like(user_id, liked_user_id)
            if mutual_like:
                # Update connection status for both users
                await self.likes_repository.update_connection_status(user_id, liked_user_id)
                
                # Notify both users about the match via WebSocket if they're online
                match_data = {
                    "event": "new_match",
                    "data": {
                        "user_id": liked_user_id,
                        "username": liked.get("username"),
                        "profile_picture": liked.get("profile_picture")
                    }
                }
                # await self.socketio_manager.send_to_user(liked_user_id, match_data)
                
                match_data_for_liker = {
                    "event": "new_match",
                    "data": {
                        "user_id": user_id,
                        "username": liker.get("username"),
                        "profile_picture": liker.get("profile_picture")
                    }
                }
                # await self.socketio_manager.send_to_user(user_id, match_data_for_liker)
                
                return success_response(
                    data={"is_match": True, "liked_user_id": liked_user_id},
                    message="Match created! You can now chat with this user.",
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

    async def unlike_user(self, user_id: str, unliked_user_id: str):
        try:
            # Check if both users exist
            liker = await self.user_repository.get_user_by_id(user_id)
            unliked = await self.user_repository.get_user_by_id(unliked_user_id)
            
            if not liker or not unliked:
                return error_response("Not found", "One or both users do not exist", status_code=404)
            
            # Check if user is trying to unlike themselves
            if str(user_id) == str(unliked_user_id):
                return error_response("Invalid operation", "Users cannot unlike themselves", status_code=400)
            
            # Check if the like exists
            like_exists = await self.likes_repository.check_like_exists(user_id, unliked_user_id)
            if not like_exists:
                return error_response("Not found", "You haven't liked this user", status_code=404)
            
            # Remove the like
            removed = await self.likes_repository.remove_like(user_id, unliked_user_id)
            
            if removed:
                # Check if they were connected (matched)
                was_connected = await self.likes_repository.check_connection_status(user_id, unliked_user_id)
                
                if was_connected:
                    # Notify the other user that the connection was broken
                    disconnect_data = {
                        "event": "connection_broken",
                        "data": {
                            "user_id": user_id,
                            "username": liker.get("username")
                        }
                    }
                    await self.socketio_manager.send_to_user(unliked_user_id, disconnect_data)
                    
                    return success_response(
                        data={"was_connected": True, "unliked_user_id": unliked_user_id},
                        message="You have unliked this user and are no longer connected",
                        status_code=200
                    )
                
                return success_response(
                    data={"was_connected": False, "unliked_user_id": unliked_user_id},
                    message="You have unliked this user",
                    status_code=200
                )
            
            return error_response("Failed to unlike", "Failed to remove the like", status_code=500)
            
        except Exception as e:
            return error_response(
                "Internal server error", 
                'An error occurred while unliking user', 
                status_code=500, 
                details={"error": str(e)}
            )

    async def get_like_status(self, user_id: str, other_user_id: str):
        try:
            current_user = await self.user_repository.get_user_by_id(user_id)
            other_user = await self.user_repository.get_user_by_id(other_user_id)
            if not current_user or not other_user:
                return error_response("Not found", "One or both users do not exist", status_code=404)
            
            # Check if the other user has liked the current user
            liked_by_other = await self.likes_repository.check_like_exists(other_user_id, user_id)
            
            # Check if the current user has liked the other user
            i_liked_them = await self.likes_repository.check_like_exists(user_id, other_user_id)
            
            # Check for mutual like
            mutual_like = liked_by_other and i_liked_them
            
            # Check connection status
            is_connected = False
            if mutual_like:
                is_connected = await self.likes_repository.check_connection_status(user_id, other_user_id)
                
            return success_response(
                data={
                    "is_liked_by_other": liked_by_other,
                    "i_liked_them": i_liked_them,
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
