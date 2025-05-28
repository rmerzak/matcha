from app.services.base_service import BaseService
from app.services.fame_rating_interface import IFameRatingService
from app.repository.user_repository import UserRepository
from app.core.responce import success_response, error_response
import logging

logger = logging.getLogger(__name__)

class FameRatingServiceImp(BaseService, IFameRatingService):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        super().__init__(user_repository)
    
    async def update_fame_rating(self, user_id: str, rating_change: float, reason: str = None):
        """
        Update fame rating with the following logic:
        - Like received: +2 points
        - Match created: +3 points (bonus)
        - Unlike received: -1 point
        - Match broken: -2 points
        - Block received: -5 points
        - Unblock: +1 point
        - Profile view: +0.5 points
        """
        try:
            success = await self.user_repository.update_fame_rating(user_id, rating_change)
            if success:
                new_rating = await self.user_repository.get_fame_rating(user_id)
                logger.info(f"Fame rating updated for user {user_id}: {rating_change:+.1f} points. New rating: {new_rating}")
                return success_response(
                    message="Fame rating updated successfully",
                    data={
                        "user_id": user_id,
                        "rating_change": rating_change,
                        "new_rating": new_rating,
                        "reason": reason
                    }
                )
            else:
                return error_response("Failed to update fame rating", "User not found", 404)
        except Exception as e:
            logger.error(f"Error updating fame rating: {str(e)}")
            return error_response("Internal server error", str(e), 500)
    
    async def get_fame_rating(self, user_id: str):
        """Get current fame rating for a user"""
        try:
            rating = await self.user_repository.get_fame_rating(user_id)
            return success_response(
                message="Fame rating retrieved successfully",
                data={"user_id": user_id, "fame_rating": rating}
            )
        except Exception as e:
            logger.error(f"Error getting fame rating: {str(e)}")
            return error_response("Internal server error", str(e), 500)
    
    async def get_fame_rating_history(self, user_id: str):
        """Get fame rating history (placeholder for future implementation)"""
        # This could be implemented with a separate fame_rating_history table
        return success_response(
            message="Fame rating history not implemented yet",
            data={"user_id": user_id, "history": []}
        ) 