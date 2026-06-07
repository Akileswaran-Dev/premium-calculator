from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.limiter import limiter
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserResponse, ChangePasswordRequest
from app.services.auth_service import AuthService
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Helper to set the HttpOnly refresh token cookie."""
    is_prod = settings.ENVIRONMENT == "production"
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_prod,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path=f"{settings.API_V1_PREFIX}/auth/refresh"
    )

def clear_refresh_cookie(response: Response) -> None:
    """Helper to delete the HttpOnly refresh token cookie."""
    is_prod = settings.ENVIRONMENT == "production"
    response.delete_cookie(
        key="refresh_token",
        path=f"{settings.API_V1_PREFIX}/auth/refresh",
        httponly=True,
        samesite="lax",
        secure=is_prod
    )


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=TokenResponse)
@limiter.limit("3/10minutes")
async def register(
    request: Request,
    response: Response,
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user account."""
    user = await AuthService.register_user(
        db=db,
        email=payload.email,
        display_name=payload.display_name,
        password=payload.password
    )
    
    # Auto-login after registration
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    user_obj, access_token, refresh_token = await AuthService.login_user(
        db=db,
        email=payload.email,
        password=payload.password,
        user_agent=user_agent,
        ip_address=ip_address
    )
    
    set_refresh_cookie(response, refresh_token)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Log in to an existing account and receive tokens."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    user_obj, access_token, refresh_token = await AuthService.login_user(
        db=db,
        email=payload.email,
        password=payload.password,
        user_agent=user_agent,
        ip_address=ip_address
    )
    
    set_refresh_cookie(response, refresh_token)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj
    }


@router.post("/refresh")
async def refresh(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a new access token using the httpOnly refresh token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token cookie missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = await AuthService.refresh_tokens(db, refresh_token)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Revoke the current user session and clear the cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        await AuthService.logout_user(db, refresh_token)
    
    clear_refresh_cookie(response)
    return {"detail": "Logged out successfully"}


@router.post("/logout-all")
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke all sessions for the current user and clear local cookie."""
    await AuthService.logout_all_sessions(db, current_user.id)
    clear_refresh_cookie(response)
    return {"detail": "Logged out from all sessions successfully"}


@router.post("/change-password")
async def change_password(
    response: Response,
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change the user's password and invalidate all sessions."""
    await AuthService.change_user_password(
        db=db,
        user=current_user,
        current_password=payload.current_password,
        new_password=payload.new_password
    )
    clear_refresh_cookie(response)
    return {"detail": "Password changed successfully. All other sessions have been logged out."}
