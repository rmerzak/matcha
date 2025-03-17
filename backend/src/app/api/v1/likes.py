import fastapi
from app.core.config import settings
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response
from typing import List
from app.core.container import Container
from fastapi import Depends
from dependency_injector.wiring import Provide
from app.core.middleware import inject
from app.schemas.users import User
from app.core.dependencies import get_current_user_info
router = fastapi.APIRouter(tags=["likes"], prefix="/likes", dependencies=[Depends(JWTBearer())])
import logging
logger = logging.getLogger(__name__)

@router.post("/add-like")
@inject
async def add_like(
):
    try:
        return {"message": "This is a placeholder response for the likes endpoint"}
    except Exception as e:
        return {"error": str(e), "status_code": 500}