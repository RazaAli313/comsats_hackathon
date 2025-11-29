"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const total = cart.items.reduce((s: any, i: any) => s + i.price * i.quantity, 0);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      <div className="mt-6 space-y-4">
        {cart.items.length === 0 && <div className="muted">Your cart is empty.</div>}
        <AnimatePresence>
          {cart.items.map((it: any) => (
            <motion.div key={it.product_id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <CartItem item={it} onRemove={handleRemove} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-lg">
          <div className="muted">Total</div>
          <div className="font-bold text-2xl">₹{total}</div>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleCheckout} disabled={cart.items.length === 0}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
