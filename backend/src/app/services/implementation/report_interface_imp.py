from app.services.base_service import BaseService
from app.repository.report_repository import ReportRepository
from app.services.reports_interface import IReportsService
import logging

logger = logging.getLogger(__name__)

class ReportServiceImp(BaseService, IReportsService):
    def __init__(self, report_repository: ReportRepository):
        self.report_repository = report_repository

    async def add_report(self, user_id: str, reported_user_id: str, report_type: str, description: str = None):
        try:
            # Validate that user is not reporting themselves
            if user_id == reported_user_id:
                raise ValueError("Cannot report yourself")
            
            # Validate report type against enum values
            valid_report_types = ['fake_account', 'inappropriate_content', 'harassment', 'other']
            if report_type not in valid_report_types:
                raise ValueError(f"Invalid report type. Must be one of: {', '.join(valid_report_types)}")
            
            # Check if user has already reported this user
            existing_report = await self.report_repository.get_report_status(user_id, reported_user_id)
            if existing_report.get("has_reported"):
                raise ValueError("You have already reported this user")
            
            result = await self.report_repository.add_report(user_id, reported_user_id, report_type, description)
            logger.info(f"User {user_id} reported user {reported_user_id} for {report_type}")
            return result
        except Exception as e:
            logger.error(f"Error adding report: {str(e)}")
            raise e

    async def get_report_status(self, user_id: str, reported_user_id: str):
        try:
            result = await self.report_repository.get_report_status(user_id, reported_user_id)
            return result
        except Exception as e:
            logger.error(f"Error getting report status: {str(e)}")
            raise e
