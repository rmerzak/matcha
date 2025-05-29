import fastapi
from app.core.config import settings
from app.core.security import JWTBearer
from app.core.responce import error_response, success_response, handle_unexpected_error
from typing import List, Optional, Literal
from app.core.container import Container
from fastapi import Depends, HTTPException, status
from dependency_injector.wiring import Provide
from app.core.middleware import inject
from app.schemas.users import User
from app.core.dependencies import get_current_user_info
from app.services.reports_interface import IReportsService
import logging

logger = logging.getLogger(__name__)
router = fastapi.APIRouter(tags=["reports"], prefix="/reports", dependencies=[Depends(JWTBearer())])

@router.post("/")
@inject
async def report_user(
    reported_user_id: str,
    current_user: User = Depends(get_current_user_info),
    report_service: IReportsService = Depends(Provide[Container.report_service])
):
    try:
        # Extract and validate required fields
        report_type = "fake_account"
        description = "this is reported user"
        
        if not reported_user_id:
            raise ValueError("reported_user_id is required")
        
        if not report_type:
            raise ValueError("report_type is required")
        
        result = await report_service.add_report(
            user_id=current_user["id"],
            reported_user_id=reported_user_id,
            report_type=report_type,
            description=description
        )
        
        return success_response(
            data={
                "id": result["id"],
                "report_time": result["report_time"].isoformat(),
                "message": "Report submitted successfully"
            },
            message="User reported successfully"
        )
    
    except ValueError as e:
        logger.warning(f"Invalid report request from user {current_user.id}: {str(e)}")
        return error_response(
            error="BadRequest",
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error reporting user: {str(e)}")
        return handle_unexpected_error(
            e,
            "Failed to report user"
        )

@router.get("/status/{reported_user_id}")
@inject
async def get_report_status(
    reported_user_id: str,
    current_user: User = Depends(get_current_user_info),
    report_service: IReportsService = Depends(Provide[Container.report_service])
):
    try:
        result = await report_service.get_report_status(
            user_id=current_user["id"],
            reported_user_id=reported_user_id
        )
        
        response_data = {
            "has_reported": result["has_reported"]
        }
        
        if result["has_reported"]:
            response_data["report_details"] = {
                "id": result["id"],
                "report_type": result["report_type"],
                "description": result["description"],
                "report_time": result["report_time"].isoformat()
            }
        
        return success_response(
            data=response_data,
            message="Report status retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Error getting report status: {str(e)}")
        return handle_unexpected_error(
            e,
            "Failed to get report status"
        )



