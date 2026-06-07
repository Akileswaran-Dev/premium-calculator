from datetime import datetime, timezone, timedelta
import uuid
import hashlib
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.repositories.user_repository import UserRepository
from app.repositories.token_repository import TokenRepository
from app.models.user import User

def hash_token(token: str) -> str:
    """Hash opaque refresh token using SHA-256."""
    return hashlib.sha256(token.encode()).hexdigest()

def utc_now() -> datetime:
    """Get UTC timezone-aware current time."""
    return datetime.now(timezone.utc)

class AuthService:
    @staticmethod
    async def register_user(
        db: AsyncSession,
        email: str,
        display_name: str,
        password: str
    ) -> User:
        """Register a new user and generate their profile and preferences."""
        existing_user = await UserRepository.get_by_email(db, email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        hashed = hash_password(password)
        user = await UserRepository.create_user_with_preferences(
            db=db,
            email=email,
            display_name=display_name,
            password_hash=hashed
        )
        return user

    @staticmethod
    async def login_user(
        db: AsyncSession,
        email: str,
        password: str,
        user_agent: str | None = None,
        ip_address: str | None = None
    ) -> tuple[User, str, str]:
        """
        Validate credentials, construct access token, generate opaque UUID refresh token,
        save SHA-256 hash of refresh token in database.
        Returns: (user, access_token, raw_refresh_token)
        """
        user = await UserRepository.get_by_email(db, email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )

        # Generate JWT access token
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

        # Generate secure random refresh token
        raw_refresh_token = str(uuid.uuid4())
        token_hash = hash_token(raw_refresh_token)
        expires_at = utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await TokenRepository.create_refresh_token(
            db=db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )

        return user, access_token, raw_refresh_token

    @staticmethod
    async def refresh_tokens(
        db: AsyncSession,
        raw_refresh_token: str
    ) -> str:
        """
        Check hash of refresh token, verify expiration/revocation, return new access token.
        """
        token_hash = hash_token(raw_refresh_token)
        token_entry = await TokenRepository.get_by_hash(db, token_hash)

        if not token_entry or token_entry.is_revoked or token_entry.expires_at < utc_now():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = await UserRepository.get_by_id(db, token_entry.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or disabled",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create new access token
        new_access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        return new_access_token

    @staticmethod
    async def logout_user(db: AsyncSession, raw_refresh_token: str) -> None:
        """Revoke user's current session by refresh token hash."""
        token_hash = hash_token(raw_refresh_token)
        token_entry = await TokenRepository.get_by_hash(db, token_hash)
        if token_entry:
            await TokenRepository.revoke_token(db, token_entry)

    @staticmethod
    async def logout_all_sessions(db: AsyncSession, user_id: uuid.UUID) -> None:
        """Revoke all sessions for a user."""
        await TokenRepository.revoke_all_user_tokens(db, user_id)

    @staticmethod
    async def change_user_password(
        db: AsyncSession,
        user: User,
        current_password: str,
        new_password: str
    ) -> None:
        """Verify current password, hash and update to new password, revoke all active sessions."""
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )

        new_hash = hash_password(new_password)
        await UserRepository.update_user(db, user, password_hash=new_hash)
        await TokenRepository.revoke_all_user_tokens(db, user.id)
