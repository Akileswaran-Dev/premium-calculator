from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.history_repository import HistoryRepository
from app.models.calculation_history import CalculationHistory
import uuid

class HistoryService:
    @staticmethod
    async def create_entry(
        db: AsyncSession,
        user_id: uuid.UUID,
        expression: str,
        result: str,
        is_error: bool = False
    ) -> CalculationHistory:
        """Create a new history entry."""
        return await HistoryRepository.create(
            db,
            user_id=user_id,
            expression=expression,
            result=result,
            is_error=is_error
        )

    @staticmethod
    async def get_user_history(
        db: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[list[CalculationHistory], int]:
        """Fetch user-specific history entries."""
        return await HistoryRepository.get_user_history(db, user_id, limit, offset)

    @staticmethod
    async def delete_entry(
        db: AsyncSession,
        user_id: uuid.UUID,
        entry_id: uuid.UUID
    ) -> bool:
        """Delete a history entry after validating user ownership."""
        entry = await HistoryRepository.get_by_id(db, entry_id)
        if not entry or entry.user_id != user_id:
            return False
        await HistoryRepository.delete(db, entry)
        return True

    @staticmethod
    async def clear_history(db: AsyncSession, user_id: uuid.UUID) -> None:
        """Clear all history entries for a specific user."""
        await HistoryRepository.clear_user_history(db, user_id)
