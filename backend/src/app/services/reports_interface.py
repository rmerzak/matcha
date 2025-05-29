from abc import ABC, abstractmethod

class IReportsService(ABC):
    @abstractmethod
    async def add_report(self, user_id: str, reported_user_id: str, report_type: str, description: str = None):
        pass
    
    @abstractmethod
    async def get_report_status(self, user_id: str, reported_user_id: str):
        pass