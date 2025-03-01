from typing import List, Optional
from fastapi import File, UploadFile
from pydantic import BaseModel, Field, EmailStr
from fastapi import Form
from uuid import UUID
from datetime import datetime
from enum import Enum
from pydantic import validator
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class SexualPreference(str, Enum):
    HETEROSEXUAL = "heterosexual"
    HOMOSEXUAL = "homosexual"
    BISEXUAL = "bisexual"
    OTHER = "other"
class User(BaseModel):
    id: Optional[UUID] = Field(default=None)
    username: str = Field(..., max_length=255)
    first_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = Field(None, unique=True, max_length=255)
    password: Optional[str] = Field(None, max_length=255)
    gender: Optional[str] = Field(None, max_length=255)
    sexual_preferences: Optional[str]
    interests: Optional[List[str]]
    profile_picture: Optional[str]
    pictures: Optional[str]
    fame_rating: Optional[float]
    location: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float]
    address: Optional[str] = Field(None, max_length=255)
    age: Optional[int]
    bio: Optional[str]
    is_verified: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    reset_password_expires: Optional[datetime]
    reset_password_token: Optional[str] = Field(default='')

class UserCreate(BaseModel):
    username: str = Field(..., max_length=255)
    first_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = Field(None, unique=True, max_length=255)
    password: Optional[str] = Field(None, max_length=255)

class UserCreateInternal(UserCreate):
    pass

class UserLogin(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):    
    gender: Optional[Gender] = None
    sexual_preferences: Optional[SexualPreference] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = Field(default=[])
    profile_picture: Optional[UploadFile | None | str] = File(default=None)
    additional_pictures: Optional[List[UploadFile] | None | List[str]] = File(default=[])
