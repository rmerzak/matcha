from typing import Any, Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import JWTBearer
from app.core.middleware import inject
from dependency_injector.wiring import Provide
from app.core.container import Container
from app.services.auth_interface import IAuthService
from fastapi import HTTPException, status

@inject
async def get_current_user(
    token: str = Depends(JWTBearer()),
    service: IAuthService = Depends(Provide[Container.auth_service])
) :
    try:
        user = await service.get_me(token)
        return user
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )

@inject
async def get_current_user_info(
    token: str = Depends(JWTBearer()),
    service: IAuthService = Depends(Provide[Container.auth_service])
) :
    try:
        user = await service.get_me_info(token)
        return user
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )