from fastapi import APIRouter, HTTPException, Request
from ...core.config import settings
from ...database.connection import get_db
import json
from bson import ObjectId
from datetime import datetime
from ...core.security import get_current_user

router = APIRouter()


@router.post("/payments/create-checkout-session")
async def create_checkout_session(payload: dict, request: Request):
    """Simulated checkout session for development.

    This endpoint validates items against the DB (authoritative prices), creates
    an order with payment_status 'paid' (simulation), decrements stock where
    possible, and returns a URL (success_url) and the created order id.
    """
    items = payload.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="No items provided")

    success_url = payload.get("success_url") or payload.get("return_url") or "/checkout/success"
    cancel_url = payload.get("cancel_url") or "/checkout/cancel"

    db = get_db()

    total = 0.0
    updates = []  # list of (ObjectId, qty) for stock decrement
    items_with_snapshot = []

    for it in items:
        pid = it.get("product_id")
        qty = int(it.get("quantity", 1) or 1)
        prod = None
        try:
            prod = db.products.find_one({"_id": ObjectId(pid)}) if pid else None
        except Exception:
            prod = None

        if not prod:
            price_snapshot = float(it.get("price", 0) or 0)
            name = it.get("name") or it.get("product_name") or None
            total += qty * price_snapshot
            items_with_snapshot.append({"product_id": pid or None, "quantity": qty, "price": price_snapshot, "name": name})
            continue

        price_snapshot = float(prod.get("price", 0) or 0)
        name = prod.get("name")
        if prod.get("stock", 0) >= qty:
            updates.append((prod.get("_id"), qty))
        # even if stock insufficient, include the item with snapshot price
        total += qty * price_snapshot
        items_with_snapshot.append({"product_id": str(prod.get("_id")), "quantity": qty, "price": price_snapshot, "name": name})

    # Try to associate the order with the authenticated user if present
    user_id = None
    try:
        user = await get_current_user(request)
        if user and user.get("id"):
            user_id = ObjectId(user.get("id"))
    except Exception:
        user_id = None

    order_doc = {
        "user_id": user_id,
        "items": items_with_snapshot,
        "total_amount": total,
        "payment_status": "paid",  # simulated
        "created_at": datetime.utcnow(),
        "simulated": True,
    }

    res = db.orders.insert_one(order_doc)

    # decrement stock for processed items
    for pid, qty in updates:
        try:
            db.products.update_one({"_id": pid}, {"$inc": {"stock": -qty}})
        except Exception:
            pass

    # Clear user's cart if we could associate the order with a user
    try:
        if user_id:
            db.carts.update_one({"user_id": user_id}, {"$set": {"items": []}})
    except Exception:
        # non-critical
        pass

    return {"url": success_url, "order_id": str(res.inserted_id)}


@router.post("/payments/webhook")
async def payments_webhook(request: Request):
    # No external webhook handling when Stripe is disabled; accept a simple ping
    try:
        body = await request.json()
    except Exception:
        body = None
    return {"received": True, "body": body}
