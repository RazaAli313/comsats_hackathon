from pydantic import BaseModel, Field
from typing import List


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)
    price: int = Field(..., ge=0)  # price snapshot in smallest currency unit


class CartCreate(BaseModel):
    items: List[CartItem]


class CartOut(BaseModel):
    id: str
    user_id: str
    items: List[CartItem]
    updated_at: str | None = None
