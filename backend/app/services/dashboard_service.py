from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
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
        """
        # Base filter for active history items of current user
        base_filter = (
            CalculationHistory.user_id == user_id,
            CalculationHistory.is_deleted == False
        )

        # 1. Total calculations
        total_query = select(func.count(CalculationHistory.id)).where(*base_filter)
        total_calculations = await db.scalar(total_query) or 0

        # Current time boundary calculations (UTC)
        now = datetime.now(timezone.utc)
        today_start = datetime.combine(now.date(), time.min, tzinfo=timezone.utc)
        week_start = today_start - timedelta(days=now.weekday())

        # 2. Today's calculations
        today_query = select(func.count(CalculationHistory.id)).where(
            *base_filter,
            CalculationHistory.created_at >= today_start
        )
        today_calculations = await db.scalar(today_query) or 0

        # 3. This week's calculations
        week_query = select(func.count(CalculationHistory.id)).where(
            *base_filter,
            CalculationHistory.created_at >= week_start
        )
        week_calculations = await db.scalar(week_query) or 0

        # 4. Recent 5 calculations summary
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
