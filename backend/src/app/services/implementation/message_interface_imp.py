from app.services.base_service import BaseService
from app.core.responce import error_response, success_response
from app.repository.message_repository import MessageRepository
from app.services.message_interface import IMessageService
from app.services.socketio_manager_interface import ISocketIOManager
from app.services.user_interface import IUserService
from app.services.likes_interface import ILikesService
from app.services.blocks_interface import IBlocksService
import logging
logger = logging.getLogger(__name__)

class MessageServiceImp(BaseService, IMessageService):
    def __init__(
        self, 
        message_repository: MessageRepository,
        socketio_manager: ISocketIOManager,
        user_service: IUserService,
        likes_service: ILikesService,
        blocks_service: IBlocksService
    ):
        self.message_repository = message_repository
        self.socketio_manager = socketio_manager
        self.user_service = user_service
        self.likes_service = likes_service
        self.blocks_service = blocks_service

    async def send_message(self, sender_id: str, receiver_id: str, content: str):
        try:
            # Check if users exist
            sender = await self.user_service.get_user_by_id(sender_id)
            receiver = await self.user_service.get_user_by_id(receiver_id)
            
            if not sender or not receiver:
                return error_response("User not found", "One or both users do not exist", 404)

            # Check if either user has blocked the other
            block_status = await self.blocks_service.check_block(sender_id, receiver_id)
            if block_status.get("data", {}).get("is_blocked", False):
                return error_response(
                    "Blocked", 
                    "Cannot send message due to blocking", 
                    403
                )

            # Check if users are connected
            like_status = await self.likes_service.get_like_status(sender_id, receiver_id)
            if not like_status.get("data", {}).get("is_connected", False):
                return error_response(
                    "Not connected", 
                    "You can only send messages to connected users", 
                    403
                )

            # Create the message
            message = await self.message_repository.create_message(
                sender_id=sender_id,
                receiver_id=receiver_id,
                content=content
            )

            return success_response(
                message="Message sent successfully",
                data=message
            )

        except Exception as e:
            return error_response("Internal server error", str(e), 500)

    async def create_message(self, sender_id: str, receiver_id: str, content: str):
        try:
            sender = await self.user_service.get_user_by_id(sender_id)
            receiver = await self.user_service.get_user_by_id(receiver_id)
            
            if not sender or not receiver:
                return None
            return await self.message_repository.create_message(
                sender_id=sender_id,
                receiver_id=receiver_id,
                content=content
            )
        except Exception as e:
            return None

    async def get_chat_history(self, user_id: str, other_user_id: str):
        try:
            # Check if users exist
            user = await self.user_service.get_user_by_id(user_id)
            other_user = await self.user_service.get_user_by_id(other_user_id)
            
            if not user or not other_user:
                return error_response("User not found", "One or both users do not exist", 404)

            # Check if either user has blocked the other
            block_status = await self.blocks_service.check_block(user_id, other_user_id)
            if block_status.get("is_blocked", False):
                return error_response(
                    "Blocked", 
                    "Cannot access chat history due to blocking", 
                    403
                )

            # Check if users are connected
            like_status = await self.likes_service.get_like_status(user_id, other_user_id)
            logger.info(f"like_status: {like_status}")
            if not like_status.get("is_connected", False):
                return error_response(
                    "Not connected", 
                    "You can only view chat history with connected users", 
                    403
                )

            # Get chat history
            messages = await self.message_repository.get_chat_history(
                user_id=user_id,
                other_user_id=other_user_id
            )

            return success_response(
                message="Chat history retrieved successfully",
                data=messages
            )

        except Exception as e:
            return error_response("Internal server error", str(e), 500)
    