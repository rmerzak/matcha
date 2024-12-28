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

@router.post("/add-view")
@inject
async def add_view(
    user_id = Form(...),
    current_user: User = Depends(get_current_user_info),
    service: IUserViewsService = Depends(Provide[Container.user_views_service]),
):
    try:
        result = await service.add_view(user_id, current_user['id'])
        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}
