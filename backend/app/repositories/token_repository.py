from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.refresh_token import RefreshToken
from datetime import datetime
import uuid

class TokenRepository:
    @staticmethod
    async def create_refresh_token(
        db: AsyncSession,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime,
        user_agent: str | None = None,
        ip_address: str | None = None
    ) -> RefreshToken:
        """Create a refresh token record in the database."""
        token_entry = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address
        )
        db.add(token_entry)
        await db.commit()
        await db.refresh(token_entry)
        return token_entry

    @staticmethod
    async def get_by_hash(db: AsyncSession, token_hash: str) -> RefreshToken | None:
        """Look up a refresh token record by its SHA-256 hash."""
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke_token(db: AsyncSession, token: RefreshToken) -> RefreshToken:
        """Revoke a specific refresh token."""
        token.is_revoked = True
        db.add(token)
        await db.commit()
        await db.refresh(token)
        return token

    @staticmethod
    async def revoke_all_user_tokens(db: AsyncSession, user_id: uuid.UUID) -> None:
        """Revoke all active refresh tokens for a user (e.g. logout all devices)."""
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False)
            .values(is_revoked=True)
        )
        await db.commit()
