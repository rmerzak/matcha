import fastapi
from app.core.config import settings
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response
from typing import List, Optional, Literal
from app.core.container import Container
from fastapi import Depends
from dependency_injector.wiring import Provide
from app.core.middleware import inject
from app.schemas.users import User
from app.core.dependencies import get_current_user_info
from app.services.likes_interface import ILikesService
import logging
logger = logging.getLogger(__name__)

router = fastapi.APIRouter(tags=["likes"], prefix="/likes", dependencies=[Depends(JWTBearer())])

@router.post("/add-like")
@inject
async def add_like(
    liked_user_id: str,
    current_user: User = Depends(get_current_user_info),
    service: ILikesService = Depends(Provide[Container.likes_service]),
):
    try:
        return await service.add_like(current_user["id"], liked_user_id)
    except Exception as e:
        logger.error(f"Error in add_like endpoint: {str(e)}")
        return error_response("Internal server error", str(e), status_code=500)

@router.delete("/unlike/{unliked_user_id}")
@inject
async def unlike_user(
    unliked_user_id: str,
    current_user: User = Depends(get_current_user_info),
    service: ILikesService = Depends(Provide[Container.likes_service]),
):
    try:
        return await service.unlike_user(current_user["id"], unliked_user_id)
    except Exception as e:
        logger.error(f"Error in unlike_user endpoint: {str(e)}")
        return error_response("Internal server error", str(e), status_code=500)

@router.get("/status/{other_user_id}")
@inject
async def get_like_status(
    other_user_id: str,
    current_user: User = Depends(get_current_user_info),
    service: ILikesService = Depends(Provide[Container.likes_service]),
):
    print(current_user["id"], other_user_id)
    return await service.get_like_status(current_user["id"], other_user_id)

@router.get("/statistics")
@inject
async def get_likes_statistics(
    current_user: User = Depends(get_current_user_info),
    service: ILikesService = Depends(Provide[Container.likes_service]),
):
    try:
        return await service.get_likes_statistics(current_user["id"])
    except Exception as e:
        logger.error(f"Error in get_likes_statistics endpoint: {str(e)}")
        return error_response("Internal server error", str(e), status_code=500)

@router.get("/received")
@inject
async def get_users_who_liked_me(
    page: int = 1,
    items_per_page: int = 10,
    connected: Optional[str] = None,
    current_user: User = Depends(get_current_user_info),
    service: ILikesService = Depends(Provide[Container.likes_service]),
):
    try:
        connection_status = None
        if connected is not None:
            if connected.lower() == "true":
                connection_status = True
            elif connected.lower() == "false":
                connection_status = False
            
        return await service.get_users_who_liked_me(
            current_user["id"], 
            page, 
            items_per_page,
            connection_status
        )
    except Exception as e:
        logger.error(f"Error in get_users_who_liked_me endpoint: {str(e)}")
        return error_response("Internal server error", str(e), status_code=500)