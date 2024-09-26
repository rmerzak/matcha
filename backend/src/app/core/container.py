
from dependency_injector import containers, providers
from app.repository.user_repository import UserRepository
from app.services import *
from app.core.db.dbinit import database

class Container(containers.DeclarativeContainer):
    def __init__(self, db):
        super().__init__()
        self
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.authentication",
            # "app.core.dependencies",
        ]
    )
    db = database
    user_repository = providers.Factory(UserRepository, db=db)

    auth_service = providers.Factory(AuthService,user_repository=user_repository)