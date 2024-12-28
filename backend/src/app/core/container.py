from dependency_injector import containers, providers
from app.repository.user_repository import UserRepository
from app.repository.user_views_repository import UserViewsRepository
from app.core.db.dbinit import create_database
from app.services.implementation.auth_service_imp import AuthServiceImp
from app.services.implementation.user_service_imp import UserServiceImp
from app.services.implementation.user_views_imp import UserViewsServiceImp
from app.services.cloudinary_service import CloudinaryService

class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.authentication",
            "app.api.v1.users",
            "app.api.v1.views",
        ]
    )

    config = providers.Configuration()

    db = providers.Singleton(create_database)

    user_repository = providers.Factory(UserRepository, db=db)
    user_views_repository = providers.Factory(UserViewsRepository, db=db)
    cloudinary = providers.Factory(CloudinaryService)
    auth_service = providers.Factory(AuthServiceImp, user_repository=user_repository)
    user_service = providers.Factory(UserServiceImp, user_repository=user_repository, cloudinary_service=cloudinary)
    user_views_service = providers.Factory(UserViewsServiceImp, user_views_repository=user_views_repository, user_repository=user_repository)