import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.getCart().then((r:any) => setCart(r)).catch(()=>{}) }, []);

  async function handlePlaceOrder() {
    setLoading(true);
    const items = cart.items.map((it:any) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price }));
    try {
      const res = await api.checkout(items);
      alert("Order placed: " + res.order_id);
      setCart({ items: [] });
    } catch (err:any) {
      alert(err?.info?.detail || err.message || "Checkout failed");
    } finally { setLoading(false) }
  }

  const total = cart.items.reduce((s:any,i:any)=>s + (i.price*i.quantity),0)

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="mt-6 space-y-4">
        {cart.items.map((it:any)=> (
          <div key={it.product_id} className="card flex items-center justify-between">
            <div>
              <div className="font-semibold">{it.product_id}</div>
              <div className="muted text-sm">Qty: {it.quantity}</div>
            </div>
            <div className="font-medium">₹{it.price * it.quantity}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-right">
        <div className="muted">Total: ₹{total}</div>
        <button className="btn btn-primary mt-3" onClick={handlePlaceOrder} disabled={loading || cart.items.length===0}>{loading?"Processing...":"Place order"}</button>
      </div>
    </div>
  )
}
