import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, SmallInteger, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # Enforces 1-to-1 with users
    )
    theme: Mapped[str] = mapped_column(
        String(20), nullable=False, default="system"
    )
    calculator_mode: Mapped[str] = mapped_column(
        String(20), nullable=False, default="standard"
    )
    decimal_precision: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=10
    )
    sound_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    def __repr__(self) -> str:
        return f"<UserPreferences user_id={self.user_id} theme={self.theme} mode={self.calculator_mode}>"
