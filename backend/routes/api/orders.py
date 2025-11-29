from fastapi import APIRouter, Depends, HTTPException
from ...core.security import get_current_user, require_admin
from ...database.connection import get_db
from ...models.order import OrderCreate
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/checkout")
def checkout(payload: OrderCreate, user=Depends(get_current_user)):
    db = get_db()
    # Validate items and stock
    total = 0
    updates = []
    items_with_snapshot = []
    for it in payload.items:
        prod = db.products.find_one({"_id": ObjectId(it.product_id)})
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product {it.product_id} not found")
        if prod.get("stock", 0) < it.quantity:
            raise HTTPException(status_code=400, detail=f"Product {it.product_id} out of stock or insufficient quantity")
        # Use authoritative server-side price to prevent client manipulation
        price_snapshot = prod.get("price", 0)
        total += it.quantity * price_snapshot
        updates.append((prod["_id"], it.quantity))
        items_with_snapshot.append({"product_id": it.product_id, "quantity": it.quantity, "price": price_snapshot})

    # create order
    order_doc = {
        "user_id": ObjectId(user.get("id")),
        "items": items_with_snapshot,
        "total_amount": total,
        "payment_status": "success",
        "created_at": datetime.utcnow(),
    }
    res = db.orders.insert_one(order_doc)

    # decrement stock
    for pid, qty in updates:
        db.products.update_one({"_id": pid}, {"$inc": {"stock": -qty}})

    # clear user's cart
    db.carts.update_one({"user_id": ObjectId(user.get("id"))}, {"$set": {"items": []}})

    return {"order_id": str(res.inserted_id), "message": "order_placed"}


@router.get("/orders/me")
def my_orders(user=Depends(get_current_user)):
    db = get_db()
    docs = db.orders.find({"user_id": ObjectId(user.get("id"))}).sort("created_at", -1)
    out = []
    for d in docs:
        # normalize nested values to JSON-safe types
        uid = d.get("user_id")
        try:
            uid_str = str(uid) if uid is not None else None
        except Exception:
            uid_str = None

        items = []
        for it in d.get("items") or []:
            pid = it.get("product_id") if isinstance(it, dict) or isinstance(it, dict) else it.get("product_id") if isinstance(it, dict) else it
            try:
                pid_str = str(pid) if pid is not None else None
            except Exception:
                pid_str = None
            # handle when item is dict-like
            if isinstance(it, dict):
                qty = it.get("quantity")
                price = it.get("price")
                name = it.get("name")
            else:
                qty = None
                price = None
                name = None
            items.append({"product_id": pid_str, "quantity": qty, "price": price, "name": name})

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


@router.get("/orders/admin", dependencies=[Depends(require_admin)])
def all_orders():
    db = get_db()
    docs = db.orders.find().sort("created_at", -1)
    out = []
    for d in docs:
        uid = d.get("user_id")
        try:
            uid_str = str(uid) if uid is not None else None
        except Exception:
            uid_str = None

        items = []
        for it in d.get("items") or []:
            try:
                pid = it.get("product_id")
            except Exception:
                pid = None
            try:
                pid_str = str(pid) if pid is not None else None
            except Exception:
                pid_str = None
            if isinstance(it, dict):
                qty = it.get("quantity")
                price = it.get("price")
                name = it.get("name")
            else:
                qty = None
                price = None
                name = None
            items.append({"product_id": pid_str, "quantity": qty, "price": price, "name": name})

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
