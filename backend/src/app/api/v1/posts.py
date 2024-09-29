import fastapi

from fastapi import Depends
from app.core.security import JWTBearer
router = fastapi.APIRouter(tags=["posts"],dependencies=[Depends(JWTBearer())],prefix="/posts")

@router.get("/posts")
async def get_posts():
    return {"data": "posts"}