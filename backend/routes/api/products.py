from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from ...database.connection import get_db
from ...models.product import ProductCreate, ProductUpdate, ProductOut
from ...core.security import require_admin, get_current_user
from bson import ObjectId
from typing import Optional
from ...utils.cloudinaryUploader import save_uploaded_image

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
        # prefer $text search, but fall back to regex if text index missing
        query_text = {"$search": q}
        query["$text"] = query_text
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query

    from pymongo.errors import OperationFailure
    try:
        total = db.products.count_documents(query)
    except OperationFailure as e:
        # fallback: if text index required for $text, use regex search on name/description
        msg = str(e)
        if "text index required" in msg or "IndexNotFound" in msg:
            # remove $text and use regex search
            qval = q
            if qval:
                regex_q = {"$or": [{"name": {"$regex": qval, "$options": "i"}}, {"description": {"$regex": qval, "$options": "i"}}]}
                # merge with other filters
                fallback_query = {k: v for k, v in query.items() if k != "$text"}
                fallback_query.update(regex_q)
                total = db.products.count_documents(fallback_query)
                cursor = db.products.find(fallback_query)
            else:
                raise
        else:
            raise
    skip = max((page - 1) * limit, 0)

    # If cursor wasn't set by the fallback above, use the normal query
    try:
        cursor
    except NameError:
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


@router.get("/products/categories")
def get_categories():
    db = get_db()
    cats = db.products.distinct("category")
    # filter out falsy values and return unique list
    cats = [c for c in cats if c]
    return {"categories": cats}


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
    # set created_at timestamp
    from datetime import datetime
    doc["created_at"] = datetime.utcnow()

    res = db.products.insert_one(doc)

    # fetch the saved document and normalize ObjectId to strings for JSON
    created = db.products.find_one({"_id": res.inserted_id})
    if created:
        created["id"] = str(created.get("_id"))
        created.pop("_id", None)
    return created


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


@router.post("/products/upload-image")
async def upload_product_image(file: UploadFile = File(...)):
    # Use cloudinary uploader util to save the image and return URL
    url = await save_uploaded_image(file, image_type="product", cloudinary_type="upload")
    return {"url": url}
