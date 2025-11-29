from fastapi import APIRouter, HTTPException, Request
from ...core.config import settings
from ...database.connection import get_db
import os

router = APIRouter()

try:
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY or os.getenv("STRIPE_SECRET_KEY")
except Exception:
    stripe = None


@router.post("/payments/create-checkout-session")
async def create_checkout_session(payload: dict):
    if stripe is None:
        raise HTTPException(status_code=500, detail="Stripe library not available")

    items = payload.get("items", [])
    if not items:
        raise HTTPException(status_code=400, detail="No items provided")

    success_url = payload.get("success_url") or payload.get("return_url") or "http://localhost:3000/checkout/success"
    cancel_url = payload.get("cancel_url") or "http://localhost:3000/checkout/cancel"

    line_items = []
    for it in items:
        # expect { product_id, quantity }
        prod = it.get("name") or it.get("product_name") or f"Product {it.get('product_id')}"
        unit_amount = int((it.get("price", 0)) * 100)  # cents
        qty = int(it.get("quantity", 1))
        line_items.append({
            "price_data": {
                "currency": "inr",
                "unit_amount": unit_amount,
                "product_data": {"name": prod},
            },
            "quantity": qty,
        })

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return {"url": session.url, "id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payments/webhook")
async def stripe_webhook(request: Request):
    if stripe is None:
        raise HTTPException(status_code=500, detail="Stripe library not available")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET or os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret) if webhook_secret else stripe.Event.construct_from(payload, stripe.api_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {e}")

    # Handle the checkout.session.completed event
    if event.type == "checkout.session.completed":
        session = event.data.object
        # In production, you would verify payment and create the order here.
        # For now we'll just log the session id.
        print("Stripe checkout completed", session.get("id"))

    return {"received": True}
