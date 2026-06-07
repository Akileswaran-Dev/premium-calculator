from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.user_preferences import UserPreferences
import uuid

class UserRepository:
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        """Retrieve user by email."""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
        """Retrieve user by UUID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user_with_preferences(
        db: AsyncSession,
        email: str,
        display_name: str,
        password_hash: str
    ) -> User:
        """Create a user and default preferences inside a single transaction."""
        user = User(
            email=email,
            display_name=display_name,
            password_hash=password_hash
        )
        db.add(user)
        await db.flush()  # Populates user.id before commit

        # Create default preferences
        preferences = UserPreferences(
            user_id=user.id,
            theme="system",
            calculator_mode="standard",
            decimal_precision=10,
            sound_enabled=False
        )
        db.add(preferences)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(db: AsyncSession, user: User, **kwargs) -> User:
        """Update user fields."""
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
