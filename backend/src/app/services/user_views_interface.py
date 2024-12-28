from abc import ABC, abstractmethod
from fastapi import Response
from app.schemas.users import ProfileUpdate
from fastapi import UploadFile, File
from typing import List

class IUserViewsService(ABC):
    @abstractmethod
    async def add_view(self, viewed: str, viewer_id: str):
        pass
    
    @abstractmethod
    async def close_scoped_session():
        pass