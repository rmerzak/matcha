from fastapi.middleware.cors import CORSMiddleware

from .api import router
from .core.config import settings
from .core.setup import create_application
from app.core.container import Container
from .websocket.router import websocket_router
app = create_application(router=router, settings=settings)
app.include_router(websocket_router)
# origins = ["*"] 
origins = ["http://localhost:3000","http://localhost:9000"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
container = Container()


@app.on_event("startup")
async def startup():
    await container.db().connect()
    container.wire(modules=["app.api.v1.authentication", "app.api.v1.users"])

@app.on_event("shutdown")
async def shutdown():
    await container.db().disconnect()
    container.unwire()