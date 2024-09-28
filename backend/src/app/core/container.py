from dependency_injector import containers, providers
from app.repository.user_repository import UserRepository
from app.services import AuthService
from app.core.db.dbinit import create_database
from app.services.implementation.auth_service_imp import AuthServiceImp

class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.authentication",
        ]
    )

    config = providers.Configuration()

    db = providers.Singleton(create_database)
    # user_repository = providers.Factory(UserRepository, db=db)
    # auth_service = providers.Factory(AuthService, user_repository=user_repository)
    user_repository = providers.Factory(UserRepository, db=db)
    auth_service = providers.Factory(AuthServiceImp, user_repository=user_repository)