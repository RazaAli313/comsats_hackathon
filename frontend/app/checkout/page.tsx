"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.getCart().then((r:any) => setCart(r)).catch(()=>{}) }, []);

  async function handlePlaceOrder() {
    setLoading(true);
    const items = cart.items.map((it:any) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price, name: it.name }));
    try {
      const res = await api.createCheckoutSession(items, window.location.origin + "/checkout/success", window.location.origin + "/checkout/cancel");
      // Redirect to Stripe Checkout
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        alert("Failed to create checkout session");
      }
    } catch (err:any) {
      alert(err?.info?.detail || err.message || "Checkout failed");
    } finally { setLoading(false) }
  }

  const total = cart.items.reduce((s:any,i:any)=>s + (i.price*i.quantity),0)

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold">Checkout</motion.h1>
      <div className="mt-6 space-y-4">
        {cart.items.map((it:any)=> (
          <motion.div key={it.product_id} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="card flex items-center justify-between">
            <div>
              <div className="font-semibold">{it.name || it.product_id}</div>
              <div className="muted text-sm">Qty: {it.quantity}</div>
            </div>
            <div className="font-medium">₹{it.price * it.quantity}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 text-right">
        <div className="muted">Total: ₹{total}</div>
        <button className="btn btn-primary mt-3" onClick={handlePlaceOrder} disabled={loading || cart.items.length===0}>{loading?"Processing...":"Place order"}</button>
      </div>
    </div>
  )
}
