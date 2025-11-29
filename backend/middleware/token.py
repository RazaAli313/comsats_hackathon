import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import Request, HTTPException,Depends
from pydantic import BaseModel,EmailStr
from backend.config.database.init import __init__
from fastapi import APIRouter
import datetime
from passlib.context import CryptContext
from backend.config.limiter import _limiter as limiter
from backend.config.database.init import get_misc_db
from jose import jwt
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")

router=APIRouter()

db = __init__("misc")  # Use the misc database for OTPs


@router.post('/auth/verifyTokens')
@limiter.limit("200/day")
async def verify_tokens(request: Request):
    admin_token = request.headers.get("adminAuthToken") or request.cookies.get("adminAuthToken")
    master_token = request.headers.get("masterAuthToken") or request.cookies.get("masterAuthToken")
    if not admin_token or not master_token:
        raise HTTPException(status_code=401, detail="Missing one or both tokens")
    try:
        admin_payload = jwt.decode(admin_token, SECRET_KEY, algorithms=[os.getenv("JWT_ALGORITHM")])
        master_payload = jwt.decode(master_token, SECRET_KEY, algorithms=[os.getenv("JWT_ALGORITHM")])
        return {"valid": True, "admin": admin_payload, "master": master_payload}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token(s)")


@router.post("/auth/getToken")
@limiter.limit("200/day")
async def get_token(request: Request):
    # print("called")
    user_agent = request.headers.get("User-Agent")
    ip_address = request.client.host
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    token = jwt.encode({"user_agent": user_agent, "ip_address": ip_address, "exp": exp}, SECRET_KEY, algorithm=os.getenv("JWT_ALGORITHM"))
    return {"token": token}

@router.post('/auth/verify' \
'Token')
@limiter.limit("200/day")
async def verify_token(request:Request):
    token = request.headers.get("adminAuthToken") or request.cookies.get("adminAuthToken")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"valid": True, "payload": payload}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class AdminLoginRequest(BaseModel):
    email: str
    password: str



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/admin/auth/login")
@limiter.limit("200/day")
async def admin_login(request:Request,data: AdminLoginRequest, db=Depends(get_misc_db)):
    # Find admin user (assuming only one admin, so query {})
    admin_doc = await db["admin"].find_one({})
    if not admin_doc or "password" not in admin_doc:
        raise HTTPException(status_code=401, detail="Admin not found or password not set")
    stored_hash = admin_doc["password"]
    if not pwd_context.verify(data.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Issue JWT token
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    token = jwt.encode({"email": data.email, "exp": exp}, SECRET_KEY, algorithm="HS256")
    return {"token": token, "message": "Login successful"}