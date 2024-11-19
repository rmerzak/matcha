import fastapi
from fastapi import Request, Response, Depends, HTTPException, status
from dependency_injector.wiring import Provide
from datetime import timedelta
from app.schemas.users import UserCreate, UserLogin, User
from app.schemas.token import TokenVerifyRequest
from app.core.config import settings
from app.core.container import Container
from app.core.middleware import inject
from app.core.responce import error_response, success_response
from app.core.security import JWTBearer
from app.services.auth_interface import IAuthService
from app.core.dependencies import get_current_user

router = fastapi.APIRouter(tags=["auth"], prefix="/auth")

@router.post("/register", status_code=status.HTTP_201_CREATED)
@inject
async def register(
    request: Request, 
    user: UserCreate, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.register(user)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@router.post("/login", status_code=status.HTTP_200_OK)
@inject
async def login(
    request: Request,
    response: Response, 
    user: UserLogin, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.login(user, response)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/resendEmailVerification", status_code=status.HTTP_200_OK)
@inject
async def resend_email_verification(
    request: Request, 
    email: str, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.resend_email_verification(email)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification email"
        )

@router.get("/verifyEmail", status_code=status.HTTP_200_OK)
@inject
async def verify_email(
    response: Response,
    request: Request, 
    token: str, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.verify_email(token, response)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify email"
        )

@router.post("/requestPasswordReset", status_code=status.HTTP_200_OK)
@inject
async def request_password_reset(
    request: Request, 
    email: str, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.request_password_reset(email)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to request password reset"
        )

@router.post("/resetPassword", status_code=status.HTTP_200_OK)
@inject
async def reset_password(
    request: Request, 
    new_password: str,
    token: str, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.reset_password(token, new_password)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )

@router.post("/verifyToken", status_code=status.HTTP_200_OK)
@inject
async def verify_token_api(
    request: Request, 
    token: TokenVerifyRequest, 
    service: IAuthService = Depends(Provide[Container.auth_service])
):
    try:
        result = await service.verify_token(token)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

@router.get("/me")
@inject
async def get_me(
    current_user: User = Depends(get_current_user)
    ):
    return current_user