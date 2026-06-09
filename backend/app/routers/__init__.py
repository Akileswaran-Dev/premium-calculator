from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.calculator import router as calculator_router
from app.routers.history import router as history_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "health_router",
    "auth_router",
    "users_router",
    "calculator_router",
    "history_router",
    "dashboard_router",
]
