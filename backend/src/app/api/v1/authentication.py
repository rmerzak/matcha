import fastapi
from app.schemas.users import UserCreate, UserLogin
from app.schemas.token import ValidateToken
from fastapi import Request, Response, Depends
from app.core.security import verify_token, createAccessToken, authenticate_user
from app.core.config import settings
from app.services.auth_service import AuthService
from app.core.container import  Container
from dependency_injector.wiring import Provide
from datetime import timedelta
from app.core.middleware import inject
front_url_prefix = settings.FRONT_URL
template_env = settings.EMAIL_TEMPLATES_ENV
verify_template = settings.EMAIL_TEMPLATES["verify_email"]
from app.core.responce import error_response, success_response

router = fastapi.APIRouter(tags=["auth"])


@router.post("/test_register", status_code=201)
@inject
def register(request: Request,  service: AuthService = Depends(Provide[Container.auth_service])):
    return service.test()



@router.post("/login", status_code=201)
async def login(request: Request,response:Response, user: UserLogin):
    existing_user  = await authenticate_user(user.username, user.password)
    if not existing_user:
        return error_response("Invalid credentials", "Invalid username or password", status_code=400)
    # if not existing_user["is_verified"]:
    #     return {"message": "Email not verified"}
    
    access_token = await createAccessToken({"sub": existing_user['email'], "utility": "ACCESS_TOKEN"}, "ACCESS_TOKEN", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    
    refresh_token = await createAccessToken({"sub": existing_user['email'], "utility": "REFRESH_TOKEN"}, "REFRESH_TOKEN")
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="Lax", max_age=max_age
    )

    return success_response({"message": "Login successful", "data": {"access_token": access_token, "token_type": "bearer"}}, status_code=200)


@router.post("/verifyToken")
async def verify_token_api(request: Request, token: ValidateToken,user = Depends(authenticate_user)):
    payload = await verify_token(token.token)
    if not payload or payload["utility"] != token.utility:
        return error_response("Invalid token", "Invalid or expired token", status_code=400)
    return success_response({"message": "Token verified successfully", "data": payload}, status_code=200)