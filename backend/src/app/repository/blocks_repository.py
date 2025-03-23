from app.repository.base_repository import BaseRepository
from typing import List, Optional
import uuid

class BlocksRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db
        