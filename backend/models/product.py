from pydantic import BaseModel, Field, constr
from typing import Optional, List


class ProductBase(BaseModel):
    name: constr(min_length=1)
    description: Optional[str] = None
    price: int = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    category: Optional[str] = None
    images: Optional[List[str]] = []


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[constr(min_length=1)]
    description: Optional[str]
    price: Optional[int]
    stock: Optional[int]
    category: Optional[str]
    images: Optional[List[str]]


class ProductOut(ProductBase):
    id: str
