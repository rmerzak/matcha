
from dependency_injector import containers, providers

from app.services import *


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.authentication",
            # "app.core.dependencies",
        ]
    )

    auth_service = providers.Factory(AuthService)