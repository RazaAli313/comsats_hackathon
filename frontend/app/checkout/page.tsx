"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import SuccessModal from "../../components/SuccessModal";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>({ items: [] });
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => { api.getCart().then((r:any) => setCart(r)).catch(()=>{}) }, []);

  async function handlePlaceOrder() {
    setLoading(true);
    const items = cart.items.map((it:any) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price, name: it.name }));
    try {
      const res = await api.createCheckoutSession(items, window.location.origin + "/checkout/success", window.location.origin + "/checkout/cancel");
      // Redirect to Stripe Checkout
      if (res && res.url) {
        // If backend returned a local URL (simulation or dev), show a modal and allow user to continue shopping
        const isLocal = res.url.startsWith(window.location.origin) || res.url.includes('localhost');
        if (isLocal) {
          // treat as immediate success
          setOrderId(res.order_id || null);
          setSuccessModalOpen(true);
          toast.success('Checkout completed — order placed');
        } else {
          // external checkout (Stripe) — redirect there
          window.location.href = res.url;
        }
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (err:any) {
      const msg = err?.info?.detail ? (typeof err.info.detail === 'string' ? err.info.detail : JSON.stringify(err.info.detail)) : (err?.message || 'Checkout failed');
      toast.error(msg);
    } finally { setLoading(false) }
  }

  async function simulatePayment() {
    setLoading(true);
    const items = cart.items.map((it:any) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price, name: it.name }));
    try {
      const res = await api.checkout(items);
      if (res && res.order_id) {
        toast.success("Payment simulated — order placed");
        try { window.dispatchEvent(new Event('cart:changed')); } catch(e) {}
        // Show success modal and let user continue shopping
        setOrderId(res.order_id || null);
        setSuccessModalOpen(true);
      } else {
        toast.error("Simulation failed");
      }
    } catch (err:any) {
      const msg = err?.info?.detail ? (typeof err.info.detail === 'string' ? err.info.detail : JSON.stringify(err.info.detail)) : (err?.message || 'Simulation failed');
      toast.error(msg);
    } finally { setLoading(false) }
  }

  async function handleRemove(productId: string) {
    setLoading(true);
    try {
      await api.removeFromCart(productId);
      setCart((c: any) => ({ ...c, items: c.items.filter((it: any) => it.product_id !== productId) }));
      toast.success('Item removed');
    } catch (e) {
      toast.error('Failed to remove item');
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
            <div className="flex items-center gap-4">
              <div className="font-medium">₹{it.price * it.quantity}</div>
              <button className="btn btn-ghost" onClick={() => handleRemove(it.product_id)}>Remove</button>
            </div>
          </motion.div>
        ))}
      </div>
        <div className="mt-6 text-right">
        <div className="muted">Total: ₹{total}</div>
        <div className="flex justify-end gap-3">
          <button className="btn btn-outline mt-3" onClick={simulatePayment} disabled={loading || cart.items.length===0}>{loading?"Processing...":"Simulate Payment"}</button>
          <button className="btn btn-primary mt-3" onClick={handlePlaceOrder} disabled={loading || cart.items.length===0}>{loading?"Processing...":"Continue to Stripe"}</button>
        </div>
      </div>
      <SuccessModal open={successModalOpen} onClose={() => setSuccessModalOpen(false)} orderId={orderId} />
    </div>
  )
}
