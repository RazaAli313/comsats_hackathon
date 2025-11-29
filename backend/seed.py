"""Simple seed script to create an admin user for local development.
Run: python backend/seed.py
"""
import os
import sys
from pathlib import Path

# Make project root importable so this script works when run directly
ROOT = Path(__file__).resolve().parent
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

from backend.database.connection import get_db
import bcrypt


def create_admin():
    db = get_db()
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "adminpass")

    existing = db.users.find_one({"email": admin_email})
    if existing:
        print("Admin user already exists")
        return

    pw_hash = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    user = {
        "username": "admin",
        "email": admin_email,
        "password_hash": pw_hash,
        "role": "admin",
    }
    res = db.users.insert_one(user)
    # ensure jti index for refresh tokens
    try:
        db.refresh_tokens.create_index("jti", unique=True)
    except Exception:
        pass
    print("Inserted admin user id:", res.inserted_id)


if __name__ == "__main__":
    create_admin()
