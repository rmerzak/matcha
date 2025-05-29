import fastapi
from app.schemas.users import UserCreate, UserCreateInternal, UserSearchParams
from fastapi import Request, Response, status, Depends, HTTPException, File, UploadFile, Query
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
from app.schemas.users import UserSortField, SortOrder
import logging
logger = logging.getLogger(__name__)

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

@router.get("/browse")
@inject
async def browse_profiles(
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    max_distance: Optional[int] = None,
    min_fame: Optional[int] = None,
    max_fame: Optional[int] = None,
    common_tags: Optional[List[str]] = Query(None),
    sort_by: Optional[str] = Query(None, enum=["age", "distance", "fame_rating", "common_tags"]),
    sort_order: Optional[SortOrder] = SortOrder.DESC,
    service: IUserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user_info)
):
    try:
        logger.info(f"Browsing profiles for user {current_user}")
        # return {"message": "Browsing profiles"}
        return await service.browse_profiles(
            user_id=current_user["id"],
            min_age=min_age,
            max_age=max_age,
            max_distance=max_distance,
            min_fame=min_fame,
            max_fame=max_fame,
            common_tags=common_tags or [],
            sort_by=sort_by,
            sort_order=sort_order.value if sort_order else "desc"
        )
    except Exception as e:
        return {"error": str(e), "status_code": 500}

@router.get("/search")
@inject
async def search_users(
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    fame_min: Optional[float] = None,
    fame_max: Optional[float] = None,
    common_tags: Optional[List[str]] = Query(None),
    sort_by: Optional[UserSortField] = None,
    sort_order: Optional[SortOrder] = SortOrder.ASC,
    service: IUserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user_info)
):
    try:
        search_params = UserSearchParams(
            age_min=age_min,
            age_max=age_max,
            fame_min=fame_min,
            fame_max=fame_max,
            common_tags=common_tags or [],
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        result = await service.search_users(search_params, current_user["id"])
        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}

@router.get("/{username}")
@inject
async def search_users_by_username(
    username: str,
    service: IUserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user_info)
):
    try:
        result = await service.search_users_by_username(username, current_user["id"])
        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}

@router.get("/id/{user_id}")
@inject
async def get_user_by_id(
    user_id: str,
    service: IUserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user_info)
):
    try:
        result = await service.get_user_by_id(user_id)
        return result
    except Exception as e:
        return {"error": str(e), "status_code": 500}


