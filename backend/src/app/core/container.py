from dependency_injector import containers, providers
from app.repository.user_repository import UserRepository
from app.repository.user_views_repository import UserViewsRepository
from app.repository.message_repository import MessageRepository
from app.repository.notification_repository import NotificationRepository
from app.core.db.dbinit import create_database
from app.services.implementation.auth_service_imp import AuthServiceImp
from app.services.implementation.user_service_imp import UserServiceImp
from app.services.implementation.user_views_imp import UserViewsServiceImp
from app.services.cloudinary_service import CloudinaryService
from app.services.implementation.socketio_manager_imp import SocketIOManagerImp
from app.repository.likes_repository import LikesRepository
from app.services.implementation.likes_interface_imp import LikesServiceImp
from app.repository.blocks_repository import BlocksRepository
from app.services.implementation.blocks_interface_imp import BlocksServiceImp
from app.services.implementation.message_interface_imp import MessageServiceImp
from app.services.implementation.notification_interface_imp import NotificationServiceImp
from app.services.implementation.fame_rating_imp import FameRatingServiceImp
from app.services.implementation.report_interface_imp import ReportServiceImp
from app.repository.report_repository import ReportRepository

class Container(containers.DeclarativeContainer):
    sio = providers.Dependency()
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.authentication",
            "app.api.v1.users",
            "app.api.v1.views",
            "app.socketio.socketio",
            "app.api.v1.notification",
            "app.api.v1.reports"
        ]
    )

    config = providers.Configuration()

    db = providers.Singleton(create_database)

    user_repository = providers.Factory(UserRepository, db=db)
    notification_repository = providers.Factory(NotificationRepository, db=db)
    message_repository = providers.Factory(MessageRepository, db=db)
    user_views_repository = providers.Factory(UserViewsRepository, db=db)
    likes_repository = providers.Factory(LikesRepository, db=db)
    report_repository = providers.Factory(ReportRepository, db=db)
    blocks_repository = providers.Factory(BlocksRepository, db=db)
    auth_service = providers.Factory(AuthServiceImp, user_repository=user_repository)
    socketio_manager = providers.Singleton(
        SocketIOManagerImp,
        user_repository=user_repository,
        auth_service=auth_service,
        blocks_repository=blocks_repository,
        sio=sio
    )
    fame_rating_service = providers.Factory(
        FameRatingServiceImp,
        user_repository=user_repository,
    )
    report_service = providers.Factory(ReportServiceImp, report_repository=report_repository)
    cloudinary = providers.Factory(CloudinaryService)
    user_service = providers.Factory(UserServiceImp, user_repository=user_repository, cloudinary_service=cloudinary, blocks_repository=blocks_repository)
    notification_service = providers.Factory(NotificationServiceImp, notification_repository=notification_repository, socketio_manager=socketio_manager, user_service=user_service)
    user_views_service = providers.Factory(UserViewsServiceImp, user_views_repository=user_views_repository, user_repository=user_repository, socketio_manager=socketio_manager, blocks_repository=blocks_repository, notification_service=notification_service, fame_rating_service=fame_rating_service)
    likes_service = providers.Factory(LikesServiceImp, user_repository=user_repository, likes_repository=likes_repository, notification_service=notification_service, fame_rating_service=fame_rating_service)
    blocks_service = providers.Factory(BlocksServiceImp, blocks_repository=blocks_repository, socketio_manager=socketio_manager, user_repository=user_repository, fame_rating_service=fame_rating_service)
    message_service = providers.Factory(MessageServiceImp, message_repository=message_repository, socketio_manager=socketio_manager, user_service=user_service, likes_service=likes_service, blocks_service=blocks_service)
    # socketio_manager = providers.Factory(SocketIOManagerImp, user_repository=user_repository, auth_service=auth_service, sio=sio)