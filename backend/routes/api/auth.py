from fastapi import APIRouter, HTTPException, Response, Depends, Request
from ...models.user import UserCreate, UserLogin, UserOut
from ...core.security import get_current_user
from ...core.jwt import create_access_token, create_refresh_token, decode_token
from ...core.config import settings
from datetime import datetime
from ...database.connection import get_db
from bson import ObjectId
import bcrypt

router = APIRouter()


@router.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate):
    db = get_db()
    existing = db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    pw_hash = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "username": payload.username,
        "email": payload.email,
        "password_hash": pw_hash,
        "role": "user",
        "created_at": None,
    }
    res = db.users.insert_one(user)
    user["id"] = str(res.inserted_id)
    return {"id": user["id"], "username": user["username"], "email": user["email"], "role": user["role"]}


@router.post("/auth/login")
def login(payload: UserLogin, response: Response):
    db = get_db()
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    pw_hash = user.get("password_hash", "")
    if not bcrypt.checkpw(payload.password.encode(), pw_hash.encode()):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    user_id = str(user.get("_id"))
    access_token = create_access_token(user_id, extra={"role": user.get("role", "user")})
    refresh_token, jti = create_refresh_token(user_id)

    # persist refresh token for revocation/rotation
    try:
        expires_at = datetime.utcfromtimestamp(decode_token(refresh_token)["exp"]) if isinstance(decode_token(refresh_token).get("exp"), int) else None
    except Exception:
        expires_at = None
    db.refresh_tokens.insert_one({
        "jti": jti,
        "user_id": ObjectId(user_id),
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
    })

    # Set HttpOnly cookies
    cookie_kwargs = {"httponly": True, "samesite": settings.COOKIE_SAMESITE}
    if settings.COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.COOKIE_DOMAIN
    if settings.COOKIE_SECURE:
        cookie_kwargs["secure"] = True

    response.set_cookie("access_token", access_token, path='/', **cookie_kwargs)
    # set refresh token cookie with an expiration matching the token
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie("refresh_token", refresh_token, path='/', max_age=max_age, **cookie_kwargs)

    return {"message": "logged_in"}


@router.get("/auth/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return {"id": user.get("id"), "username": user.get("username"), "email": user.get("email"), "role": user.get("role")}


@router.post("/auth/refresh")
def refresh(request: Request, response: Response):
    db = get_db()
    token = request.cookies.get("refresh_token")
    if not token:
        # try Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        jti = payload.get("jti")
        if not user_id or not jti:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    doc = db.refresh_tokens.find_one({"jti": jti, "user_id": ObjectId(user_id)})
    if not doc:
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    # check expiry if stored
    if doc.get("expires_at"):
        try:
            if doc["expires_at"] < datetime.utcnow():
                db.refresh_tokens.delete_one({"jti": jti})
                raise HTTPException(status_code=401, detail="Refresh token expired")
        except Exception:
            pass

    # rotate refresh token: issue new refresh + access token
    new_refresh_token, new_jti = create_refresh_token(user_id)
    user_doc = db.users.find_one({"_id": ObjectId(user_id)})
    role = user_doc.get("role", "user") if user_doc else "user"
    access_token = create_access_token(user_id, extra={"role": role})

    # insert new token and remove old
    try:
        expires_at = datetime.utcfromtimestamp(decode_token(new_refresh_token)["exp"]) if isinstance(decode_token(new_refresh_token).get("exp"), int) else None
    except Exception:
        expires_at = None

    db.refresh_tokens.insert_one({
        "jti": new_jti,
        "user_id": ObjectId(user_id),
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
    })
    db.refresh_tokens.delete_one({"jti": jti})

    cookie_kwargs = {"httponly": True, "samesite": settings.COOKIE_SAMESITE}
    if settings.COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.COOKIE_DOMAIN
    if settings.COOKIE_SECURE:
        cookie_kwargs["secure"] = True

    response.set_cookie("access_token", access_token, path='/', **cookie_kwargs)
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie("refresh_token", new_refresh_token, path='/', max_age=max_age, **cookie_kwargs)

    return {"message": "token_refreshed"}


@router.post("/auth/logout")
def logout(request: Request, response: Response):
    db = get_db()
    token = request.cookies.get("refresh_token")
    if token:
        try:
            payload = decode_token(token)
            jti = payload.get("jti")
            if jti:
                db.refresh_tokens.delete_one({"jti": jti})
        except Exception:
            pass

    # Delete cookies (use same path/domain attributes)
    cookie_kwargs = {"path": "/"}
    if settings.COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.COOKIE_DOMAIN
    response.delete_cookie("access_token", **cookie_kwargs)
    response.delete_cookie("refresh_token", **cookie_kwargs)
    return {"message": "logged_out"}
