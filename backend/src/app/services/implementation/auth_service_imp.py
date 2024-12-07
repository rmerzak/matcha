from app.services.base_service import BaseService
from app.repository.user_repository import UserRepository
from app.schemas.users import UserLogin
from app.core.security import createAccessToken, verify_password, get_password_hash,verify_token
from app.core.config import settings
from app.core.responce import error_response, success_response
from fastapi import Response, status
from datetime import timedelta
from app.schemas.users import UserCreateInternal
from app.schemas.token import TokenVerifyRequest, TokenVerifyResponse
from app.core.security import generate_email_verification_token, send_email
from app.services.auth_interface import IAuthService
from fastapi import HTTPException
front_url_prefix = settings.FRONT_URL
template_env = settings.EMAIL_TEMPLATES_ENV
verify_template = settings.EMAIL_TEMPLATES["verify_email"]
class AuthServiceImp(BaseService, IAuthService):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        super().__init__(user_repository)

    async def close_scoped_session(self):
        try:
            await self.user_repository.close_session()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to close database session"
            )

    async def login(self, user: UserLogin, response: Response):
        try:
            existing_user = await self.user_repository.get_user_by_username(user.username)
            if not existing_user:
                raise HTTPException( status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

            if not await verify_password(user.password, existing_user["password"]):
                raise HTTPException( status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
            
            access_token = await createAccessToken(
                {"sub": existing_user['email'], "utility": "ACCESS_TOKEN"}, 
                "ACCESS_TOKEN", 
                timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )

            refresh_token = await createAccessToken(
                {"sub": existing_user['email'], "utility": "REFRESH_TOKEN"}, 
                "REFRESH_TOKEN"
            )
            
            max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
            response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="Lax", max_age=max_age)

            return success_response({"message": "Login successful", "result": {"access_token": access_token, "token_type": "bearer"}}, status_code=status.HTTP_200_OK)

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred during login")

    async def register(self, user):
        try:
            existing_user = await self.user_repository.get_user_by_username(user.username)
            if existing_user:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User with this username already exists")

            existing_email = await self.user_repository.get_user_by_email(user.email)
            if existing_email:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="User with this email already exists")

            user_internal_dict = user.model_dump()
            user_internal_dict["password"] = get_password_hash(user_internal_dict["password"])
            user_internal_dict["is_verified"] = False

            user_internal = UserCreateInternal(**user_internal_dict)
            created_user = await self.user_repository.create_user_internal(user_internal)
            created_user_dict = dict(created_user)

            verification_token = generate_email_verification_token(user_internal.email)
            template = template_env.get_template(verify_template)
            verification_link = f"{front_url_prefix}/verifyEmail?token={verification_token}"
            body = template.render(username=user_internal.username, email=user_internal.email, verification_link=verification_link)
        
            await send_email(email=user_internal.email, body=body, subject="Email Verification")

            return success_response({"message": "User created successfully", "result": created_user_dict}, status_code=status.HTTP_201_CREATED)

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="An error occurred during registration")

    async def resend_email_verification(self, email: str):
        try:
            user = await self.user_repository.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this email not found")

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

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail="Failed to send verification email")

    async def verify_email(self, token: str, response: Response):
        try:
            payload = await verify_token(token)
            if not payload or payload["utility"] != "EMAIL_VERIFICATION":
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

            email = payload["sub"]
            user = await self.user_repository.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this email not found")

            if user["is_verified"]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")
            
            await self.user_repository.update_user_verification(email)

            access_token = await createAccessToken({"sub": user['email'], "utility": "ACCESS_TOKEN"}, "ACCESS_TOKEN", timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
            
            refresh_token = await createAccessToken({"sub": user['email'], "utility": "REFRESH_TOKEN"}, "REFRESH_TOKEN")
            
            max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
            response.set_cookie( key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="Lax", max_age=max_age)

            return success_response({"message": "Email verified successfully","result": {"access_token": access_token, "token_type": "bearer"}}, status_code=status.HTTP_200_OK)

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to verify email")

    async def request_password_reset(self, email: str):
        try:
            user = await self.user_repository.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this email not found")

            reset_token = await createAccessToken(
                {"sub": user['email'], "utility": "PASSWORD_RESET"}, 
                "ACCESS_TOKEN", 
                timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
            )
            
            template = template_env.get_template(settings.EMAIL_TEMPLATES["reset_password"])
            reset_link = f"{front_url_prefix}/resetPassword?token={reset_token}"
            body = template.render(
                username=user["username"],
                email=user["email"],
                reset_link=reset_link,
            )

            await send_email(email=user["email"], body=body, subject="Password Reset")
            return success_response({"message": "Password reset email sent"}, status_code=status.HTTP_200_OK)

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send password reset email"
            )

    async def reset_password(self, token: str, new_password: str):
        try:
            payload = await verify_token(token)
            if not payload or payload["utility"] != "PASSWORD_RESET":
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

            email = payload["sub"]
            user = await self.user_repository.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this email not found")

            hashed_password = get_password_hash(new_password)
            print(hashed_password)
            await self.user_repository.update_user_password(email, hashed_password)
            return success_response({"message": "Password reset successfully"}, status_code=status.HTTP_200_OK)

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reset password"
            )
    async def verify_token(self, token: TokenVerifyRequest):
        try:
            token_dict = token.dict()
            payload = await verify_token(token_dict["token"])
        
            if not payload:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
            
            if payload["utility"] != token_dict["utility"]:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token utility")
        
            result = TokenVerifyResponse(
                is_valid=True,
                expires_at=payload.get("exp"),
                user_email=payload.get("sub")
            )
        
            return success_response(
                data={
                    "message": "Token verified successfully",
                    "result": result.dict()
                },
                status_code=status.HTTP_200_OK
            )

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to verify token"
            )
    
    async def get_me(self, token: str):
        try:
            payload = await verify_token(token)
            print(payload)
            if not payload:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
            
            email = payload["sub"]
            user = await self.user_repository.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            user_dict = dict(user)
            return user_dict

            
            # return success_response({"message": "User retrieved successfully", "result": user_dict}, status_code=status.HTTP_200_OK)

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user"
            )
    async def get_me_info(self, token: str):
        try:
            payload = await verify_token(token)
            if not payload:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
            
            email = payload["sub"]
            user = await self.user_repository.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
            user_dict = dict(user)
            return user_dict

        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get user"
            )