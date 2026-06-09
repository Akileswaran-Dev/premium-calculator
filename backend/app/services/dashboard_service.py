from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case
from datetime import datetime, timezone, time, timedelta
from app.models.calculation_history import CalculationHistory
import uuid

class DashboardService:
    @staticmethod
    async def get_stats(db: AsyncSession, user_id: uuid.UUID) -> dict:
        """
        Retrieves dashboard statistics for the user:
        - Total calculations
        - Today's calculations
        - This week's calculations (since Monday)
        - Recent 5 calculations
        Consolidates counts into a single query using conditional CASE aggregation.
        """
        # Base filter for active history items of current user
        base_filter = (
            CalculationHistory.user_id == user_id,
            CalculationHistory.is_deleted == False
        )

        # Current time boundary calculations (UTC)
        now = datetime.now(timezone.utc)
        today_start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
        week_start = today_start - timedelta(days=now.weekday())

        # Consolidated counts query using conditional aggregation
        stats_query = select(
            func.count(CalculationHistory.id).label("total"),
            func.count(case((CalculationHistory.created_at >= today_start, 1))).label("today"),
            func.count(case((CalculationHistory.created_at >= week_start, 1))).label("week")
        ).where(*base_filter)

        stats_result = await db.execute(stats_query)
        stats_row = stats_result.fetchone()

        total_calculations = stats_row[0] if stats_row and stats_row[0] is not None else 0
        today_calculations = stats_row[1] if stats_row and stats_row[1] is not None else 0
        week_calculations = stats_row[2] if stats_row and stats_row[2] is not None else 0

        # Recent 5 calculations summary
        recent_query = select(CalculationHistory).where(
            *base_filter
        ).order_by(
            CalculationHistory.created_at.desc()
        ).limit(5)
        
        result = await db.execute(recent_query)
        recent_items = list(result.scalars().all())

        return {
            "total_calculations": total_calculations,
            "today_calculations": today_calculations,
            "week_calculations": week_calculations,
            "recent_calculations": recent_items
        }
