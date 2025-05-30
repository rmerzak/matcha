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
from app.services.user_views_interface import IUserViewsService
from fastapi import Depends, Form
router = fastapi.APIRouter(tags=["views"], prefix="/views", dependencies=[Depends(JWTBearer())])
import logging
logger = logging.getLogger(__name__)
@router.post("/add-view")
@inject
async def add_view(
    user_id = Form(...),
    current_user: User = Depends(get_current_user_info),
    service: IUserViewsService = Depends(Provide[Container.user_views_service]),
):
    try:
        logger.info(f"User {current_user['username']} is adding view to user {user_id}")
        result = await service.add_view(user_id, current_user['id'])
        print(result)
        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}


@router.get("/get-my-views")
@inject
async def get_my_views(
    page: Optional[int] = 1,
    item_per_page: Optional[int] = 10,
    current_user: User = Depends(get_current_user_info),
    service: IUserViewsService = Depends(Provide[Container.user_views_service]),
):
    try:
        logger.info(f"User {current_user['username']} is getting their views")
        result = await service.get_my_views(current_user['id'], page, item_per_page)
        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}
