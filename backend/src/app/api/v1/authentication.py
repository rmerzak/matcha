import fastapi
from app.schemas.users import UserCreate, UserLogin
from fastapi import Request, Response
from app.core.security import verify_token, createAccessToken, authenticate_user
from app.core.config import settings
from datetime import timedelta
front_url_prefix = settings.FRONT_URL

template_env = settings.EMAIL_TEMPLATES_ENV
verify_template = settings.EMAIL_TEMPLATES["verify_email"]

router = fastapi.APIRouter(tags=["auth"])

@router.get("/tests")
async def test():
    data = await get_all_users()
    return {"data": data}

@router.post("/login", status_code=201)
async def login(request: Request,response:Response, user: UserLogin):
    existing_user  = await authenticate_user(user.username, user.password)
    if not existing_user:
        return {"message": "Invalid credentials"}
    if not existing_user["is_verified"]:
        return {"message": "Email not verified"}
    
    access_token = await createAccessToken({"sub": existing_user['email'], "utility": "ACCESS_TOKEN"}, "ACCESS_TOKEN", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    
    refresh_token = await createAccessToken({"sub": existing_user['email'], "utility": "REFRESH_TOKEN"}, "REFRESH_TOKEN")
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="Lax", max_age=max_age
    )

    return {"access_token": access_token, "token_type": "bearer"}