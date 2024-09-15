import fastapi
router = fastapi.APIRouter(tags=["users"])


@router.get("/test")
async def test():
    return {"message": "Hello World"}