import fastapi
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response
from app.services.notification_interface import INotificationService
from app.core.container import Container
from dependency_injector.wiring import Provide
from app.core.middleware import inject
from app.schemas.users import User
from fastapi import Depends
router = fastapi.APIRouter(tags=["notification"], prefix="/notification", dependencies=[Depends(JWTBearer())])

@router.post("/send-notification")
@inject
async def send_notification(
    message: str, user_id: str, service: INotificationService = Depends(Provide[Container.notification_service])):
    try:
        await service.send_notification(message, user_id)
        return success_response("Notification sent successfully")
    except Exception as e:
        return error_response(str(e), "Error sending notification", 500)
