from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.history import HistoryListResponse
from app.services.history_service import HistoryService

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=HistoryListResponse)
async def get_history(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve authenticated user's calculation history.
    """
    items, total = await HistoryService.get_user_history(
        db, user_id=current_user.id, limit=limit, offset=offset
    )
    return {"items": items, "total": total}


@router.delete("/clear", status_code=status.HTTP_200_OK)
async def clear_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Clear all calculation history for the authenticated user.
    """
    await HistoryService.clear_history(db, user_id=current_user.id)
    return {"message": "Calculation history cleared successfully"}


@router.delete("/{entry_id}", status_code=status.HTTP_200_OK)
async def delete_entry(
    entry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a specific history entry.
    """
    deleted = await HistoryService.delete_entry(
        db, user_id=current_user.id, entry_id=entry_id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History entry not found or you are not authorized to delete it.",
        )
    return {"message": "History entry deleted successfully"}
