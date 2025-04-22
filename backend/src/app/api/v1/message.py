import fastapi
from app.core.config import settings
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response
from typing import List
from app.core.container import Container
from dependency_injector.wiring import Provide
from app.core.middleware import inject
from typing import Optional
from app.schemas.users import User
from app.core.dependencies import get_current_user_info
from app.services.message_interface import IMessageService
from fastapi import Depends, Form
import logging

logger = logging.getLogger(__name__)
router = fastapi.APIRouter(tags=["message"], prefix="/message", dependencies=[Depends(JWTBearer())])

@router.post("/send")
@inject
async def send_message(
    receiver_id: str = Form(...),
    content: str = Form(...),
    current_user: User = Depends(get_current_user_info),
    service: IMessageService = Depends(Provide[Container.message_service]),
):
    try:
        return await service.send_message(
            sender_id=current_user["id"],
            receiver_id=receiver_id,
            content=content
        )
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        return error_response("Internal server error", str(e), 500)

@router.get("/history/{other_user_id}")
@inject
async def get_chat_history(
    other_user_id: str,
    page: int = 1,
    items_per_page: int = 50,
    current_user: User = Depends(get_current_user_info),
    service: IMessageService = Depends(Provide[Container.message_service]),
):
    try:
        return await service.get_chat_history(
            user_id=current_user["id"],
            other_user_id=other_user_id,
            page=page,
            items_per_page=items_per_page
        )
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        return error_response("Internal server error", str(e), 500)