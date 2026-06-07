from pydantic import BaseModel, Field, field_validator
import re
from app.schemas.user import UserResponse

class RegisterRequest(BaseModel):
    email: str = Field(..., max_length=255)
    display_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v_clean = v.strip().lower()
        email_regex = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        if not email_regex.match(v_clean):
            raise ValueError("Invalid email format")
        return v_clean

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        v_clean = v.strip()
        name_regex = re.compile(r"^[a-zA-Z\s\-\']+$")
        if not name_regex.match(v_clean):
            raise ValueError("Display name can only contain letters, spaces, hyphens, and apostrophes")
        return v_clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
