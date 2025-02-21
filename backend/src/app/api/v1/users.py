import fastapi
from app.schemas.users import UserCreate, UserCreateInternal
from fastapi import Request, Response, status, Depends, HTTPException, File, UploadFile
from app.core.security import get_password_hash, generate_email_verification_token, send_email, verify_token, createAccessToken
from app.core.config import settings
from datetime import timedelta
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response
from app.schemas.users import ProfileUpdate
from typing import List
from app.services.user_interface import IUserService
from app.core.container import Container
from dependency_injector.wiring import Provide
from app.core.middleware import inject
from app.schemas.users import User
from typing import Optional
from app.core.dependencies import get_current_user_info
template_env = settings.EMAIL_TEMPLATES_ENV
verify_template = settings.EMAIL_TEMPLATES["verify_email"]
router = fastapi.APIRouter(tags=["users"], prefix="/users", dependencies=[Depends(JWTBearer())])


@router.put("/update-profile")
@inject
async def update_profile(
    profile_data: ProfileUpdate,
    service: IUserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user_info)
):
    try:

        result = await service.update_profile(
            profile_data, 
            current_user['email'], 
            profile_data.profile_picture, 
            profile_data.additional_pictures
        )

        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}

