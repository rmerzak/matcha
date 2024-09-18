import fastapi
router = fastapi.APIRouter(tags=["users"])
from app.crud.users_crud import get_all_users

@router.get("/test")
async def test():
    data = await get_all_users()
    return {"data": data}