
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class TokenVerifyRequest(BaseModel):
    token: str
    utility: Optional[str] = None

class TokenVerifyResponse(BaseModel):
    is_valid: bool
    expires_at: Optional[datetime] = None
    user_email: Optional[str] = None