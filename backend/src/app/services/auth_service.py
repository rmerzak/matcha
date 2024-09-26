from app.services.base_service import BaseService
from app.repository.user_repository import UserRepository


class AuthService(BaseService):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
        super().__init__(user_repository)
    async def test(self):
        query = "SELECT * FROM users WHERE email = :email"
        print("ssssssssss", query)
        data = await self.user_repository.get_all_users()  # Use await here
        return data