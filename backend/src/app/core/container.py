from dependency_injector import containers, providers
from app.repository.user_repository import UserRepository
from app.repository.user_views_repository import UserViewsRepository
from app.core.db.dbinit import create_database
from app.services.implementation.auth_service_imp import AuthServiceImp
from app.services.implementation.user_service_imp import UserServiceImp
from app.services.implementation.user_views_imp import UserViewsServiceImp
from app.services.cloudinary_service import CloudinaryService
from app.services.implementation.socketio_manager_imp import SocketIOManagerImp
from app.repository.likes_repository import LikesRepository
from app.services.implementation.likes_interface_imp import LikesServiceImp
class Container(containers.DeclarativeContainer):
    sio = providers.Dependency()
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.authentication",
            "app.api.v1.users",
            "app.api.v1.views",
            "app.websocket.socketio"
        ]
    )

    config = providers.Configuration()

    db = providers.Singleton(create_database)

    user_repository = providers.Factory(UserRepository, db=db)
    user_views_repository = providers.Factory(UserViewsRepository, db=db)
    likes_repository = providers.Factory(LikesRepository, db=db)
    auth_service = providers.Factory(AuthServiceImp, user_repository=user_repository)
    socketio_manager = providers.Singleton(
        SocketIOManagerImp,
        user_repository=user_repository,
        auth_service=auth_service,
        sio=sio
    )
    cloudinary = providers.Factory(CloudinaryService)
    user_service = providers.Factory(UserServiceImp, user_repository=user_repository, cloudinary_service=cloudinary)
    user_views_service = providers.Factory(UserViewsServiceImp, user_views_repository=user_views_repository, user_repository=user_repository, socketio_manager=socketio_manager)
    likes_service = providers.Factory(LikesServiceImp, user_repository=user_repository, socketio_manager=socketio_manager, likes_repository=likes_repository)
    # socketio_manager = providers.Factory(SocketIOManagerImp, user_repository=user_repository, auth_service=auth_service, sio=sio)