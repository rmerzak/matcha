from fastapi import APIRouter

from .users import router as users_router
from .authentication import router as auth_router
router = APIRouter(prefix="/v1")

router.include_router(users_router)
router.include_router(auth_router)

