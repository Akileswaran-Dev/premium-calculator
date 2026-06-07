from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class HistoryEntryResponse(BaseModel):
    id: UUID
    expression: str
    result: str
    is_error: bool
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryListResponse(BaseModel):
    items: list[HistoryEntryResponse]
    total: int
