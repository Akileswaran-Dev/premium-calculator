from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse
from app.services.dashboard_service import DashboardService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse, status_code=status.HTTP_200_OK)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve statistics and recent activity for the authenticated user's dashboard.
    """
    stats = await DashboardService.get_stats(db, user_id=current_user.id)
    return stats
