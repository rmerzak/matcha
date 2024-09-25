from app.services.base_service import BaseService


class AuthService(BaseService):
    def __init__(self):
        super().__init__(None)
    def test(self):
        return "Test successful"