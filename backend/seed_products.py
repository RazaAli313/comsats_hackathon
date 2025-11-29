"""Seed sample products for local development.
Run: python backend/seed_products.py
"""
import os
import sys
from pathlib import Path

# Make the project root importable so this script can be run directly
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.database.connection import get_db
from bson import ObjectId


SAMPLE = [
    {
        "name": "Ultra Laptop",
        "description": "Thin, light laptop with 16GB RAM",
        "price": 120000,
        "stock": 5,
        "category": "electronics",
        "images": ["/images/laptop.jpg"],
    },
    {
        "name": "Noise-cancelling Headphones",
        "description": "Comfortable over-ear headphones",
        "price": 25000,
        "stock": 12,
        "category": "electronics",
        "images": ["/images/headphones.jpg"],
    },
]


def seed():
    db = get_db()
    existing = db.products.count_documents({})
    if existing:
        print("Products already seeded")
        return
    for p in SAMPLE:
        db.products.insert_one({**p})
    # create text index for search
    try:
        db.products.create_index([("name", "text"), ("description", "text")])
        print("Created text index on products.name and products.description")
    except Exception as e:
        print("Failed to create index:", e)
    print("Seeded sample products")


if __name__ == "__main__":
    seed()
