from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.user_repository import UserRepository

class UserService:
    @staticmethod
    async def update_profile(db: AsyncSession, user: User, display_name: str) -> User:
        """Update user's profile display name."""
        return await UserRepository.update_user(db, user, display_name=display_name)

    @staticmethod
    async def get_stats(db: AsyncSession, user_id) -> dict:
        """Get calculation stats (stubbed for Phase 2)."""
        return {
            "total_calculations": 0,
            "calculations_today": 0
        }
