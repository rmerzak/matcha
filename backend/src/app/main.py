from fastapi.middleware.cors import CORSMiddleware

from .api import router
from .core.config import settings
from .core.setup import create_application

app = create_application(router=router, settings=settings)

# origins = ["*"]
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
