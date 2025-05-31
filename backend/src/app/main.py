from fastapi.middleware.cors import CORSMiddleware

from .api import router
from .core.config import settings
from .core.setup import create_application
from app.core.container import Container
from .socketio.socketio import sio
app = create_application(router=router, settings=settings)

# app.include_router(websocket_router)
origins = ["*"] 
# origins = ["http://localhost:3000"] 
# socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
container = Container(sio=sio)


@app.on_event("startup")
async def startup():
    await container.db().connect()
    container.wire(modules=["app.api.v1.authentication", "app.api.v1.users", "app.socketio.socketio", "app.api.v1.likes", "app.api.v1.blocks", "app.api.v1.message", "app.api.v1.notification", "app.api.v1.reports"])

@app.on_event("shutdown")
async def shutdown():
    await container.db().disconnect()
    container.unwire()
# app.mount("/ws", socket_app)