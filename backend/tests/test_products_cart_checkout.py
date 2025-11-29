import pytest
from fastapi.testclient import TestClient
from backend.server import app
from backend.database.connection import get_db

client = TestClient(app)


def make_admin(db):
    # ensure admin exists
    admin_email = "admin@example.com"
    db.users.delete_many({"email": admin_email})
    import bcrypt
    pw = bcrypt.hashpw(b"adminpass", bcrypt.gensalt()).decode()
    db.users.insert_one({"username": "admin", "email": admin_email, "password_hash": pw, "role": "admin"})


def test_product_crud_and_checkout():
    db = get_db()
    db.products.delete_many({})
    db.carts.delete_many({})
    db.orders.delete_many({})
    make_admin(db)

    # login as admin
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "adminpass"})
    assert res.status_code == 200
    cookies = res.cookies

    # create product
    res2 = client.post("/api/products", json={"name": "T-Shirt", "price": 1000, "stock": 10}, cookies=cookies)
    assert res2.status_code == 200
    pid = res2.json()["id"]

    # list products
    res3 = client.get("/api/products")
    assert res3.status_code == 200
    assert res3.json()["total"] >= 1

    # register and login a user
    db.users.delete_many({"email": "buyer@example.com"})
    client.post("/api/auth/register", json={"username":"buyer","email":"buyer@example.com","password":"buyerpw"})
    resu = client.post("/api/auth/login", json={"email":"buyer@example.com","password":"buyerpw"})
    assert resu.status_code == 200
    user_cookies = resu.cookies

    # add to cart
    res_add = client.post("/api/cart/add", json={"product_id": pid, "quantity": 2, "price": 1000}, cookies=user_cookies)
    assert res_add.status_code == 200

    # checkout
    res_co = client.post("/api/checkout", json={"items": [{"product_id": pid, "quantity": 2, "price": 1000}]}, cookies=user_cookies)
    assert res_co.status_code == 200
    assert "order_id" in res_co.json()
