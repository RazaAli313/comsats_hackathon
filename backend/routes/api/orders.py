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
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        out.append(d)
    return {"orders": out}


@router.get("/orders/admin", dependencies=[Depends(require_admin)])
def all_orders():
    db = get_db()
    docs = db.orders.find().sort("created_at", -1)
    out = []
    for d in docs:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        out.append(d)
    return {"orders": out}
