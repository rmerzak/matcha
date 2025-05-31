from app.repository.base_repository import BaseRepository
from typing import List, Optional
import uuid
import logging

logger = logging.getLogger(__name__)

class ReportRepository(BaseRepository):
    def __init__(self, db):
        super().__init__(db)
        self.db = db

    async def add_report(self, user_id: str, reported_user_id: str, report_type: str, description: str = None):
        """Create a new report"""
        query = """
            INSERT INTO reports (reporter, reported, report_type, description)
            VALUES (:reporter, :reported, :report_type, :description)
            RETURNING id, report_time
        """
        logger.info(f"Creating report from user {user_id} for user {reported_user_id}, type {report_type}, and description {description}")
        values = {
            "reporter": user_id,
            "reported": reported_user_id,
            "report_type": report_type,
            "description": description
        }
        
        result = await self.db.fetch_one(query, values)
        return {
            "id": str(result["id"]),
            "report_time": result["report_time"]
        } if result else None

    async def get_report_status(self, user_id: str, reported_user_id: str):
        """Get report status between two users"""
        query = """
            SELECT id, report_type, description, report_time
            FROM reports
            WHERE reporter = :reporter AND reported = :reported
            ORDER BY report_time DESC
            LIMIT 1
        """
        logger.info(f"Getting report status for user {user_id} reporting user {reported_user_id}")
        values = {
            "reporter": user_id,
            "reported": reported_user_id
        }
        
        result = await self.db.fetch_one(query, values)
        if result:
            return {
                "id": str(result["id"]),
                "report_type": result["report_type"],
                "description": result["description"],
                "report_time": result["report_time"],
                "has_reported": True
            }
        return {"has_reported": False}
