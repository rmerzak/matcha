import fastapi
from app.schemas.users import UserCreate, UserCreateInternal
from fastapi import Request, Response, status, Depends
from app.core.security import get_password_hash, generate_email_verification_token, send_email, verify_token, createAccessToken
from app.core.config import settings
from datetime import timedelta
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response

template_env = settings.EMAIL_TEMPLATES_ENV
verify_template = settings.EMAIL_TEMPLATES["verify_email"]
router = fastapi.APIRouter(tags=["users"], prefix="/users", dependencies=[Depends(JWTBearer())])