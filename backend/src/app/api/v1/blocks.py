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
from app.services.blocks_interface import IBlocksService
import logging
logger = logging.getLogger(__name__)

router = fastapi.APIRouter(tags=["blocks"], prefix="/blocks", dependencies=[Depends(JWTBearer())])

@router.post("/add-block")
@inject
async def add_block(
    blocked_user_id: str,
    current_user: User = Depends(get_current_user_info),
    service: IBlocksService = Depends(Provide[Container.blocks_service]),
):
    try:
        return await service.add_block(current_user["id"], blocked_user_id)
    except Exception as e:
        logger.error(f"Error adding block: {e}")
        return error_response("Internal server error", str(e), status_code=500)

@router.delete("/remove-block")
@inject
async def unblock_user(
    blocked_user_id: str,
    current_user: User = Depends(get_current_user_info),
    service: IBlocksService = Depends(Provide[Container.blocks_service]),
):
    try:
        return await service.unblock_user(current_user["id"], blocked_user_id)
    except Exception as e:
        logger.error(f"Error removing block: {e}")
        return error_response("Internal server error", str(e), status_code=500)


@router.get("/get-blocked-users")
@inject
async def get_blocked_users(
    page: int = 1,
    items_per_page: int = 10,
    current_user: User = Depends(get_current_user_info),
    service: IBlocksService = Depends(Provide[Container.blocks_service]),
):
    try:
        return await service.get_blocked_users(current_user["id"], page, items_per_page)
    except Exception as e:
        logger.error(f"Error getting blocked users: {e}")
        return error_response("Internal server error", str(e), status_code=500)

@router.get("/check-block")
@inject
async def check_block(
    blocked_user_id: str,
    current_user: User = Depends(get_current_user_info),
    service: IBlocksService = Depends(Provide[Container.blocks_service]),
):
    try:
        return await service.check_block(current_user["id"], blocked_user_id)
    except Exception as e:
        logger.error(f"Error checking block: {e}")
        return error_response("Internal server error", str(e), status_code=500)