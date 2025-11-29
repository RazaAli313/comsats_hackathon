from fastapi import APIRouter, HTTPException, Depends, Query
from ...database.connection import get_db
from ...models.product import ProductCreate, ProductUpdate, ProductOut
from ...core.security import require_admin, get_current_user
from bson import ObjectId
from typing import Optional

router = APIRouter()


def _obj_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


@router.get("/products")
def list_products(q: Optional[str] = Query(None), category: Optional[str] = Query(None), page: int = 1, limit: int = 12, min_price: Optional[int] = None, max_price: Optional[int] = None, sort: Optional[str] = None):
    db = get_db()
    query = {}
    if q:
        # text search over name and description
        query["$text"] = {"$search": q}
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query

    total = db.products.count_documents(query)
    skip = max((page - 1) * limit, 0)

    cursor = db.products.find(query)
    if sort:
        # simple mapping: price_asc, price_desc, newest
        if sort == "price_asc":
            cursor = cursor.sort("price", 1)
        elif sort == "price_desc":
            cursor = cursor.sort("price", -1)
        elif sort == "newest":
            cursor = cursor.sort("created_at", -1)

    docs = cursor.skip(skip).limit(limit)
    items = []
    for d in docs:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        items.append(d)

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/products/{product_id}")
def get_product(product_id: str):
    db = get_db()
    oid = _obj_id(product_id)
    doc = db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.post("/products", dependencies=[Depends(require_admin)])
def create_product(payload: ProductCreate):
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = None
    res = db.products.insert_one(doc)
    return {"id": str(res.inserted_id), **doc}


@router.put("/products/{product_id}", dependencies=[Depends(require_admin)])
def update_product(product_id: str, payload: ProductUpdate):
    db = get_db()
    oid = _obj_id(product_id)
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    db.products.update_one({"_id": oid}, {"$set": update})
    doc = db.products.find_one({"_id": oid})
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.delete("/products/{product_id}", dependencies=[Depends(require_admin)])
def delete_product(product_id: str):
    db = get_db()
    oid = _obj_id(product_id)
    res = db.products.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "deleted"}
