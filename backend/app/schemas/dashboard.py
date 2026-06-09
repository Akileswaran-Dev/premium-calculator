from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class RecentCalculation(BaseModel):
    id: UUID
    expression: str
    result: str
    is_error: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_calculations: int
    today_calculations: int
    week_calculations: int
    recent_calculations: list[RecentCalculation]
