from app.services.base_service import BaseService
from app.core.responce import error_response, success_response
from app.repository.blocks_repository import BlocksRepository
from app.services.blocks_interface import IBlocksService
from app.services.socketio_manager_interface import ISocketIOManager
from app.repository.user_repository import UserRepository

class BlocksServiceImp(BaseService, IBlocksService):
    def __init__(self, blocks_repository: BlocksRepository, socketio_manager: ISocketIOManager, user_repository: UserRepository):
        self.blocks_repository = blocks_repository
        self.socketio_manager = socketio_manager
        self.user_repository = user_repository
    
    async def add_block(self, blocker_id: str, blocked_id: str):
        try:
            blocker = await self.user_repository.get_user_by_id(blocker_id)
            blocked = await self.user_repository.get_user_by_id(blocked_id)
            
            if not blocker:
                return error_response("User not found", "The blocker user does not exist", 404)
            
            if not blocked:
                return error_response("Blocked user not found", "The user you're trying to block does not exist", 404)
            
            if str(blocker_id) == str(blocked_id):
                return error_response("Invalid operation", "You cannot block yourself", 400)
            
            reverse_block = await self.blocks_repository.get_block(blocked_id, blocker_id)
            if reverse_block:
                return error_response(
                    "Cannot block user", 
                    "You cannot block a user who has already blocked you", 
                    403
                )
            
            existing_block = await self.blocks_repository.get_block(blocker_id, blocked_id)
            if existing_block:
                return success_response(
                    message="User is already blocked",
                    data={"block_id": existing_block["id"], "blocker_id": blocker_id, "blocked_id": blocked_id}
                )
            
            try:
                block = await self.blocks_repository.add_block(blocker_id, blocked_id)
                
                # Notify through socket if needed
                # await self.socketio_manager.send_to_user(
                #     blocked_id, 
                #     {"event": "blocked", "data": {"blocker_id": blocker_id}}
                # )
                
                return success_response(
                    message="User blocked successfully",
                    data={"block_id": block["id"], "blocker_id": blocker_id, "blocked_id": blocked_id}
                )
            except Exception as e:
                # Handle the specific exception from the repository
                if "Cannot block a user who has already blocked you" in str(e):
                    return error_response("Cannot block user", str(e), 403)
                raise
        except Exception as e:
            return error_response("Internal server error", str(e), 500)
    
    async def unblock_user(self, blocker_id: str, blocked_id: str):
        try:
            # Check if block exists
            existing_block = await self.blocks_repository.get_block(blocker_id, blocked_id)
            if not existing_block:
                return error_response("Not blocked", "You have not blocked this user", 400)
            
            # Remove block
            success = await self.blocks_repository.unblock_user(blocker_id, blocked_id)
            
            if not success:
                return error_response("Failed to unblock", "Could not unblock the user", 500)
            
            # Notify through socket if needed
            # await self.socketio_manager.send_to_user(
            #     blocked_id, 
            #     {"event": "unblocked", "data": {"blocker_id": blocker_id}}
            # )
            
            return success_response(
                message="User unblocked successfully",
                data={"blocker_id": blocker_id, "blocked_id": blocked_id}
            )
        except Exception as e:
            return error_response("Internal server error", str(e), 500)
    
    async def get_blocked_users(self, blocker_id: str, page: int = 1, items_per_page: int = 10):
        try:
            # Get blocked users with pagination
            result = await self.blocks_repository.get_blocked_users(
                blocker_id, 
                page, 
                items_per_page
            )
            
            return success_response(
                message="Blocked users retrieved successfully",
                data=result
            )
        except Exception as e:
            return error_response("Internal server error", str(e), 500)
    
    async def check_block(self, user_id1: str, user_id2: str):
        try:
            # Check if either user has blocked the other
            is_blocked = await self.blocks_repository.check_block(user_id1, user_id2)
            
            # Get specific direction if blocked
            user1_blocked_user2 = False
            user2_blocked_user1 = False
            
            if is_blocked:
                block1 = await self.blocks_repository.get_block(user_id1, user_id2)
                block2 = await self.blocks_repository.get_block(user_id2, user_id1)
                
                user1_blocked_user2 = block1 is not None
                user2_blocked_user1 = block2 is not None
            
            return success_response(
                message="Block status retrieved successfully",
                data={
                    "me": user_id1,
                    "user_id": user_id2,
                    "is_blocked": is_blocked,
                    "i_blocked_user": user1_blocked_user2,
                    "user_blocked_me": user2_blocked_user1
                }
            )
        except Exception as e:
            return error_response("Internal server error", str(e), 500)