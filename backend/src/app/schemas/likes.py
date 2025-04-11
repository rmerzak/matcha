from typing import List, Optional
from fastapi import File, UploadFile
from pydantic import BaseModel, Field, EmailStr
from fastapi import Form
from uuid import UUID
from datetime import datetime
from enum import Enum
from pydantic import validator

class Like(BaseModel):
    id: Optional[UUID] = Field(default=None)
    user_id: UUID
    liked_user_id: UUID
    created_at: datetime