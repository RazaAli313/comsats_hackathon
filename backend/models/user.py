from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: Optional[Literal["user", "admin"]] = "user"
