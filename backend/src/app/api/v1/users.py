import fastapi
router = fastapi.APIRouter(tags=["users"])
from app.crud.users_crud import get_all_users, get_user_by_email
from app.schemas.users import UserCreate
from fastapi import Request
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
        return {"message": "User already exists"}
    return {"message": "User created"}