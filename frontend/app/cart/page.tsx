import React, { useEffect, useState } from "react";
import api from "../../services/api";
import CartItem from "../../components/CartItem";

export default function CartPage() {
  const [cart, setCart] = useState<any>({ items: [] });

  useEffect(() => {
    api.getCart().then((r: any) => setCart(r)).catch(() => setCart({ items: [] }));
  }, []);

  async function handleRemove(productId: string) {
    await api.removeFromCart(productId);
    setCart((c: any) => ({ ...c, items: c.items.filter((it: any) => it.product_id !== productId) }));
  }

  async function handleCheckout() {
    const items = cart.items.map((it: any) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price }));
    try {
      const res = await api.checkout(items);
      alert("Order placed: " + res.order_id);
      setCart({ items: [] });
    } catch (err: any) {
      alert(err?.info?.detail || err.message || "Checkout failed");
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      <div className="mt-6 space-y-4">
        {cart.items.length === 0 && <div className="muted">Your cart is empty.</div>}
        {cart.items.map((it: any) => (
          <CartItem key={it.product_id} item={it} onRemove={handleRemove} />
        ))}
      </div>

      <div className="mt-8">
        <button className="btn btn-primary" onClick={handleCheckout} disabled={cart.items.length === 0}>
          Checkout
        </button>
      </div>
    </div>
  );
}
