from fastapi import APIRouter, Depends, status
from app.core.dependencies import get_current_user
from app.schemas.calculator import (
    EvaluateRequest,
    EvaluateResponse,
    ValidateRequest,
    ValidateResponse,
)
from app.services.calculator_service import CalculatorService
from app.models.user import User

from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.history_service import HistoryService

router = APIRouter(prefix="/calculator", tags=["Calculator"])


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate(
    payload: EvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Safely evaluate a math expression and return the result.
    Requires user session and automatically saves successful calculations to history.
    """
    result, is_error = CalculatorService.evaluate(payload.expression)
    
    if not is_error:
        try:
            await HistoryService.create_entry(
                db,
                user_id=current_user.id,
                expression=payload.expression,
                result=result,
                is_error=False
            )
        except Exception as db_err:
            # We log the error but still return the calculation result to the user
            # to make the app resilient to database-write hiccups.
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to auto-save calculation history entry: {db_err}")

    return {
        "expression": payload.expression,
        "result": result,
        "is_error": is_error,
        "error_message": "Evaluation error" if is_error else None,
    }


@router.post("/validate", response_model=ValidateResponse)
async def validate(
    payload: ValidateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Dry-run validate a math expression's syntax.
    """
    is_valid, error_msg = CalculatorService.validate(payload.expression)
    return {
        "expression": payload.expression,
        "is_valid": is_valid,
        "error_message": error_msg,
    }
