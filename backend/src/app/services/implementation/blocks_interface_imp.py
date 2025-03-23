from app.services.base_service import BaseService
from app.core.responce import error_response, success_response
from app.repository.blocks_repository import BlocksRepository
from app.services.blocks_interface import IBlocksService
from app.services.socketio_manager_interface import ISocketIOManager
from app.repository.user_repository import UserRepository

class BlocksServiceImp(BaseService, IBlocksService):
    def __init__(self, blocks_repository: BlocksRepository, socketio_manager: ISocketIOManager, user_repository: UserRepository):
        self.blocks_repository = blocks_repository
        self.socketio_manager = socketio_manager
        self.user_repository = user_repository
