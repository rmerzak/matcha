import fastapi
from app.crud.users_crud import get_all_users, get_user_by_email, get_user_by_username, create_user_internal, update_user_verification
from app.schemas.users import UserCreate, UserCreateInternal
from fastapi import Request, Response, status
from app.core.security import get_password_hash, generate_email_verification_token, send_email, verify_token, createAccessToken
from app.core.config import settings
from datetime import timedelta
front_url_prefix = settings.FRONT_URL
from app.core.responce import error_response, success_response

template_env = settings.EMAIL_TEMPLATES_ENV
verify_template = settings.EMAIL_TEMPLATES["verify_email"]
router = fastapi.APIRouter(tags=["users"])
@router.get("/test")
async def test():
    data = await get_all_users()
    return {"data": data}

# @router.post("/user", response_model=UserCreate, status_code=201)
@router.post("/user", status_code=201)
async def create_user(request: Request, user: UserCreate):

    existing_user = await get_user_by_email(user.email)
    print(existing_user)
    if existing_user:
        return error_response("User already exists", "User with this email already exists", status_code=status.HTTP_400_BAD_REQUEST)
    existing_user_name = await get_user_by_username(user.username)
    if existing_user_name:
        return error_response("Username already exists", "User with this username already exists", status_code=status.HTTP_400_BAD_REQUEST)
    user_internal_dict = user.model_dump()
    user_internal_dict["password"] = get_password_hash(user_internal_dict["password"])
    user_internal_dict["is_verified"] = False

    user_internal = UserCreateInternal(**user_internal_dict)
    
    created_user = await create_user_internal(user_internal)
    
    verification_token = generate_email_verification_token(user_internal.email)
    template = template_env.get_template(verify_template)
    verification_link = f"{front_url_prefix}/verifyEmail?token={verification_token}"
    body = template.render(
        username=user_internal.username,
        email=user_internal.email,
        verification_link=verification_link,
    )
    
    await send_email(email=user_internal.email, body=body, subject="Email Verification")

    
    return success_response({"message": "User created successfully", "data": created_user}, status_code=status.HTTP_201_CREATED)

# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsic3ViIjoibGFjZXJhNzI0OEBvZmlvbmsuY29tIn0sImV4cCI6MTcyNjkwMzk4OCwidXRpbGl0eSI6IkVNQUlMX1ZFUklGSUNBVElPTiJ9.nvnOazg-4BQ9tnDKc9ggsFzOTbgp0eQ2wOjGCnVQ5pM
@router.post("/resendEmailVerification")
async def resend_email_verification(request: Request, email: str):
    user = await get_user_by_email(email)
    if not user:
        return error_response("User not found", "User with this email not found", status_code=status.HTTP_404_NOT_FOUND)
    # try to use the createAccessToken function
    verification_token = generate_email_verification_token(user["email"])
    template = template_env.get_template(verify_template)
    verification_link = f"{front_url_prefix}/verifyEmail?token={verification_token}"
    body = template.render(
        username=user["username"],
        email=user["email"],
        verification_link=verification_link,
    )
    await send_email(email=user["email"], body=body, subject="Email Verification")
    return success_response({"message": "Verification email sent"}, status_code=status.HTTP_200_OK)

@router.get("/verifyEmail")
async def verify_email(response: Response, request: Request, token: str):
    payload = await verify_token(token)
    if not payload or payload["utility"] != "EMAIL_VERIFICATION":
        return error_response("Invalid token", "Invalid or expired token", status_code=status.HTTP_400_BAD_REQUEST)
    email = payload["sub"]
    user = await get_user_by_email(email)
    print(user)
    if not user:
        return error_response("User not found", "User with this email not found", status_code=status.HTTP_404_NOT_FOUND)
    if user["is_verified"]:
        return error_response("Email already verified", "Email already verified", status_code=status.HTTP_400_BAD_REQUEST)
    updatedUser = await update_user_verification(email)

    accessExpireToken = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    accessToken = await createAccessToken({"sub": user['email'], "utility": "ACCESS_TOKEN"}, "ACCESS_TOKEN", accessExpireToken)
    refreshToken = await createAccessToken({"sub": user['email'], "utility": "REFRESH_TOKEN"}, "REFRESH_TOKEN")
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    response.set_cookie(
        key="refresh_token", value=refreshToken, httponly=True, secure=True, samesite="Lax", max_age=max_age
    )

    return success_response({"message": "Email verified successfully", "data": {"access_token": accessToken, "token_type": "bearer"}}, status_code=status.HTTP_200_OK)

@router.post("/requestPasswordReset")
async def request_password_reset(request: Request, email: str):
    user = await get_user_by_email(email)
    if not user:
        return error_response("User not found", "User with this email not found", status_code=status.HTTP_404_NOT_FOUND)
    reset_token = await createAccessToken({"sub": user['email'], "utility": "PASSWORD_RESET"}, "ACCESS_TOKEN", timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES))
    template = template_env.get_template(settings.EMAIL_TEMPLATES["reset_password"])
    reset_link = f"{front_url_prefix}/resetPassword?token={reset_token}"
    body = template.render(
        username=user["username"],
        email=user["email"],
        reset_link=reset_link,
    )
    await send_email(email=user["email"], body=body, subject="Password Reset")
    return success_response({"message": "Password reset email sent"}, status_code=status.HTTP_200_OK)

@router.post("/resetPassword")
async def reset_password(request: Request, new_password: str):
    user = await get_user_by_email(email)
    if not user:
        return error_response("User not found", "User with this email not found", status_code=status.HTTP_404_NOT_FOUND)
    updated_user = await update_user_password(email, new_password)
    return success_response({"message": "Password reset successfully", "data": updated_user}, status_code=status.HTTP_200_OK)