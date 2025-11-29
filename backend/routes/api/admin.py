from fastapi import APIRouter, Depends, HTTPException
from ...core.security import require_admin
from ...database.connection import get_db
from bson import ObjectId
from datetime import datetime
import bcrypt
from typing import List, Dict

from pydantic import BaseModel

from bson import ObjectId as BsonObjectId


def _serialize_value(v):
    # convert ObjectId and other BSON types to JSON-safe values
    try:
        if isinstance(v, BsonObjectId):
            return str(v)
    except Exception:
        pass
    # nested structures
    if isinstance(v, dict):
        return {k: _serialize_value(val) for k, val in v.items()}
    if isinstance(v, list):
        return [_serialize_value(x) for x in v]
    return v


def _normalize_doc(doc: dict) -> dict:
    if not isinstance(doc, dict):
        return doc
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
            continue
        out[k] = _serialize_value(v)
    return out


class AdminCreateUser(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"


class AdminUpdateUser(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str | None = None
    role: str | None = None

router = APIRouter()

@router.get("/admin/users")
def list_users(page: int = 1, limit: int = 50, user=Depends(require_admin)):
    db = get_db()
    skip = max((page - 1) * limit, 0)
    cursor = db.users.find({}, {"password_hash": 0}).skip(skip).limit(limit)
    out = []
    for d in cursor:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        out.append(d)
    total = db.users.count_documents({})
    return {"users": out, "total": total, "page": page, "limit": limit}


@router.post("/admin/users", dependencies=[Depends(require_admin)])
def create_user(payload: AdminCreateUser):
    db = get_db()
    existing = db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    pw_hash = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
    user = {
        "username": payload.username,
        "email": payload.email,
        "password_hash": pw_hash,
        "role": payload.role,
        "created_at": datetime.utcnow(),
    }
    res = db.users.insert_one(user)
    user["id"] = str(res.inserted_id)
    user.pop("password_hash", None)
    return user


@router.put("/admin/users/{user_id}", dependencies=[Depends(require_admin)])
def update_user(user_id: str, payload: AdminUpdateUser):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    update = {}
    if payload.username is not None:
        update["username"] = payload.username
    if payload.email is not None:
        update["email"] = payload.email
    if payload.role is not None:
        update["role"] = payload.role
    if payload.password:
        update["password_hash"] = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()

    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")

    db.users.update_one({"_id": oid}, {"$set": update})
    doc = db.users.find_one({"_id": oid}, {"password_hash": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.delete("/admin/users/{user_id}")
def delete_user(user_id: str, user=Depends(require_admin)):
    db = get_db()
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")
    res = db.users.delete_one({"_id": oid})
    # cleanup related data: carts, orders, refresh_tokens
    db.carts.delete_many({"user_id": oid})
    db.orders.delete_many({"user_id": oid})
    db.refresh_tokens.delete_many({"user_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "user_deleted"}


@router.get("/admin/insights")
def insights(user=Depends(require_admin)):
    db = get_db()
    users_count = db.users.count_documents({})
    products_count = db.products.count_documents({})
    orders_count = db.orders.count_documents({})
    carts_count = db.carts.count_documents({})
    revenue_cursor = db.orders.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ])
    revenue = 0
    try:
        for r in revenue_cursor:
            revenue = r.get("total", 0)
    except Exception:
        revenue = 0

    # simple recent orders sample
    recent = []
    for d in db.orders.find().sort("created_at", -1).limit(10):
        recent.append(_normalize_doc(d))

    # aggregate top selling products
    product_sales = []
    try:
        pipeline = [
            {"$unwind": "$items"},
            {"$group": {"_id": "$items.product_id", "quantity": {"$sum": "$items.quantity"}, "revenue": {"$sum": {"$multiply": ["$items.quantity", "$items.price"]}}}},
            {"$sort": {"quantity": -1}},
            {"$limit": 10}
        ]
        for r in db.orders.aggregate(pipeline):
            pid = r.get("_id")
            prod = None
            try:
                # pid can be ObjectId or string; handle both
                if isinstance(pid, BsonObjectId):
                    prod = db.products.find_one({"_id": pid})
                else:
                    try:
                        prod = db.products.find_one({"_id": ObjectId(pid)}) if pid else None
                    except Exception:
                        prod = None
            except Exception:
                prod = None
            product_sales.append({
                "product_id": str(pid) if pid else None,
                "name": prod.get("name") if prod else None,
                "quantity": r.get("quantity", 0),
                "revenue": r.get("revenue", 0),
            })
    except Exception:
        product_sales = []

    # visitors count if tracked
    visitors_count = 0
    try:
        visitors_count = db.visitors.count_documents({}) if "visitors" in db.list_collection_names() else 0
    except Exception:
        visitors_count = 0

    return {
        "users_count": users_count,
        "products_count": products_count,
        "orders_count": orders_count,
        "carts_count": carts_count,
        "total_revenue": revenue,
        "recent_orders": recent,
        "product_sales": product_sales,
        "visitors_count": visitors_count,
    }
