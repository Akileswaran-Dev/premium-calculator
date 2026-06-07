from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import uuid
import re

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str
    avatar_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateUserRequest(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        v_stripped = v.strip()
        name_regex = re.compile(r"^[a-zA-Z\s\-\']+$")
        if not name_regex.match(v_stripped):
            raise ValueError("Display name can only contain letters, spaces, hyphens, and apostrophes")
        return v_stripped


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserStatsResponse(BaseModel):
    total_calculations: int
    calculations_today: int
