from typing import Optional
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.status import HTTP_401_UNAUTHORIZED
from ..database.connection import get_db
from .jwt import decode_token
from bson import ObjectId


security = HTTPBearer(auto_error=False)


def _get_token_from_request(request: Request) -> Optional[str]:
    # Prefer cookie-based access_token, fallback to Authorization header
    cookie = request.cookies.get("access_token")
    if cookie:
        return cookie
    # If Authorization header present, use it
    auth: HTTPAuthorizationCredentials = request.state.__dict__.get("auth") if hasattr(request.state, "auth") else None
    return None


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        # try Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token")

    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User not found")
    # remove password hash before returning
    user.pop("password_hash", None)
    user["id"] = str(user["_id"])
    return user


def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Admin privileges required")
    return user
