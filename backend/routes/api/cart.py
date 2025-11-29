from fastapi import APIRouter, Depends, HTTPException
from ...core.security import get_current_user
from ...database.connection import get_db
from ...models.cart import CartItem
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.get("/cart")
def get_cart(user=Depends(get_current_user)):
    db = get_db()
    doc = db.carts.find_one({"user_id": ObjectId(user.get("id"))})
    if not doc:
        return {"items": []}
    # convert ids
    for it in doc.get("items", []):
        it["product_id"] = str(it.get("product_id"))
    return {"items": doc.get("items", []), "updated_at": doc.get("updated_at")}


@router.post("/cart/add")
def add_to_cart(item: CartItem, user=Depends(get_current_user)):
    db = get_db()
    # ensure product exists and has enough stock
    prod = db.products.find_one({"_id": ObjectId(item.product_id)})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    if prod.get("stock", 0) < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    # upsert user's cart
    cart = db.carts.find_one({"user_id": ObjectId(user.get("id"))})
    if not cart:
        cart_doc = {"user_id": ObjectId(user.get("id")), "items": [{"product_id": ObjectId(item.product_id), "quantity": item.quantity, "price": item.price}], "updated_at": datetime.utcnow()}
        db.carts.insert_one(cart_doc)
        return {"message": "added"}

    # find existing item
    updated = False
    for it in cart.get("items", []):
        if str(it.get("product_id")) == item.product_id:
            it["quantity"] = it.get("quantity", 0) + item.quantity
            it["price"] = item.price
            updated = True
            break
    if not updated:
        cart["items"].append({"product_id": ObjectId(item.product_id), "quantity": item.quantity, "price": item.price})

    cart["updated_at"] = datetime.utcnow()
    db.carts.update_one({"user_id": ObjectId(user.get("id"))}, {"$set": {"items": cart["items"], "updated_at": cart["updated_at"]}})
    return {"message": "added"}


@router.put("/cart/update")
def update_cart(item: CartItem, user=Depends(get_current_user)):
    db = get_db()
    cart = db.carts.find_one({"user_id": ObjectId(user.get("id"))})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    found = False
    new_items = []
    for it in cart.get("items", []):
        if str(it.get("product_id")) == item.product_id:
            if item.quantity <= 0:
                # remove
                continue
            it["quantity"] = item.quantity
            it["price"] = item.price
            found = True
        new_items.append(it)

    if not found:
        raise HTTPException(status_code=404, detail="Item not in cart")

    db.carts.update_one({"user_id": ObjectId(user.get("id"))}, {"$set": {"items": new_items, "updated_at": datetime.utcnow()}})
    return {"message": "updated"}


@router.delete("/cart/remove")
def remove_from_cart(product_id: str, user=Depends(get_current_user)):
    db = get_db()
    cart = db.carts.find_one({"user_id": ObjectId(user.get("id"))})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    new_items = [it for it in cart.get("items", []) if str(it.get("product_id")) != product_id]
    db.carts.update_one({"user_id": ObjectId(user.get("id"))}, {"$set": {"items": new_items, "updated_at": datetime.utcnow()}})
    return {"message": "removed"}
