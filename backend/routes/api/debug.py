from fastapi import APIRouter, HTTPException, Depends
from ...database.connection import get_db
from bson import ObjectId
from ...core.security import get_current_user

router = APIRouter()


@router.get("/debug/orders")
def debug_orders(limit: int = 50):
    """Return recent orders with user_id shown as string (or null) for debugging."""
    db = get_db()
    docs = db.orders.find().sort("created_at", -1).limit(limit)
    out = []
    for d in docs:
        uid = d.get("user_id")
        try:
            uid_str = str(uid) if uid is not None else None
        except Exception:
            uid_str = None
        # Normalize items: ensure product_id and other nested ObjectIds are strings
        items = []
        raw_items = d.get("items") or []
        for it in raw_items:
            pid = it.get("product_id") if isinstance(it, dict) else None
            try:
                pid_str = str(pid) if pid is not None else None
            except Exception:
                pid_str = None
            items.append({
                "product_id": pid_str,
                "quantity": it.get("quantity") if isinstance(it, dict) else None,
                "price": it.get("price") if isinstance(it, dict) else None,
                "name": it.get("name") if isinstance(it, dict) else None,
            })

        created = d.get("created_at")
        try:
            created_iso = created.isoformat() if hasattr(created, "isoformat") else str(created)
        except Exception:
            created_iso = str(created)

        out.append({
            "id": str(d.get("_id")),
            "user_id": uid_str,
            "items": items,
            "total_amount": d.get("total_amount"),
            "payment_status": d.get("payment_status"),
            "created_at": created_iso,
            "simulated": bool(d.get("simulated", False)),
        })
    return {"orders": out}


@router.post("/debug/claim")
def claim_order(order_id: str | None = None, user=Depends(get_current_user)):
    """Claim an orphan order (user_id is null) for the authenticated user.

    If `order_id` is provided, attempt to claim that order (must be orphan).
    Otherwise claim the most recent orphan order.
    This is intended as a developer convenience to recover recent test orders.
    """
    db = get_db()
    target = None
    if order_id:
        try:
            oid = ObjectId(order_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid order_id")
        target = db.orders.find_one({"_id": oid, "user_id": None})
        if not target:
            raise HTTPException(status_code=404, detail="Order not found or already claimed")
    else:
        target = db.orders.find_one({"user_id": None}, sort=[("created_at", -1)])
        if not target:
            raise HTTPException(status_code=404, detail="No orphan orders found")

    try:
        db.orders.update_one({"_id": target["_id"]}, {"$set": {"user_id": ObjectId(user.get("id"))}})
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to claim order")

    return {"claimed_order": str(target.get("_id")), "user_id": user.get("id")}
