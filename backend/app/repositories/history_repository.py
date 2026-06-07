from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, func
from app.models.calculation_history import CalculationHistory
import uuid

class HistoryRepository:
    @staticmethod
    async def create(
        db: AsyncSession,
        user_id: uuid.UUID,
        expression: str,
        result: str,
        is_error: bool = False
    ) -> CalculationHistory:
        """Create a new calculation history entry."""
        entry = CalculationHistory(
            user_id=user_id,
            expression=expression,
            result=result,
            is_error=is_error
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry

    @staticmethod
    async def get_user_history(
        db: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[list[CalculationHistory], int]:
        """Retrieve paginated calculation history and total count for a user."""
        # Get count
        count_query = select(func.count(CalculationHistory.id)).where(CalculationHistory.user_id == user_id)
        total = await db.scalar(count_query) or 0

        # Get items
        items_query = select(CalculationHistory).where(
            CalculationHistory.user_id == user_id
        ).order_by(
            CalculationHistory.created_at.desc()
        ).limit(limit).offset(offset)
        
        result = await db.execute(items_query)
        items = list(result.scalars().all())
        
        return items, total

    @staticmethod
    async def get_by_id(db: AsyncSession, entry_id: uuid.UUID) -> CalculationHistory | None:
        """Retrieve a specific history entry by UUID."""
        result = await db.execute(select(CalculationHistory).where(CalculationHistory.id == entry_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def delete(db: AsyncSession, entry: CalculationHistory) -> None:
        """Delete a history entry."""
        await db.delete(entry)
        await db.commit()

    @staticmethod
    async def clear_user_history(db: AsyncSession, user_id: uuid.UUID) -> None:
        """Delete all history entries for a specific user."""
        stmt = delete(CalculationHistory).where(CalculationHistory.user_id == user_id)
        await db.execute(stmt)
        await db.commit()
