from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class OrderItem(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)
    price: int = Field(..., ge=0)


class OrderCreate(BaseModel):
    items: List[OrderItem]
    shipping: Optional[dict] = None


class OrderOut(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total_amount: int
    payment_status: Literal["success", "pending", "failed"]
    created_at: Optional[str] = None
