"use client";

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getMyOrders()
      .then((r: any) => {
        if (!mounted) return;
        setRaw(r);
        setOrders(r.orders || []);
      })
      .catch((err: any) => {
        toast.error(err?.info?.detail || err?.message || 'Failed to load orders');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false }
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.getMyOrders();
      setRaw(r);
      setOrders(r.orders || []);
    } catch (err: any) {
      toast.error(err?.info?.detail || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold">My Orders</motion.h1>

      <div className="mt-6 space-y-4">
        {loading && <div className="text-zinc-500">Loading…</div>}
        {!loading && orders.length === 0 && <div className="text-zinc-600">You have no orders yet.</div>}
        <div className="mt-2">
          <button className="btn btn-ghost mr-2" onClick={refresh}>Refresh</button>
          <span className="text-sm text-zinc-500">Found {orders.length} orders</span>
        </div>
        {raw && (
          <details className="mt-2 text-xs text-zinc-500">
            <summary>Raw response</summary>
            <pre className="whitespace-pre-wrap mt-2">{JSON.stringify(raw, null, 2)}</pre>
          </details>
        )}

        {orders.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded-2xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-black">Order ID: <span className="font-mono">{o.id}</span></div>
                <div className="font-semibold mt-1">₹{o.total_amount ?? 0}</div>
                <div className="text-xs text-black">{o.created_at}</div>
              </div>
              <div>
                <div className={`px-3 py-1 rounded-full text-sm ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {o.payment_status}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-black mb-2">Items</div>
              <div className="space-y-2">
                {(o.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      {/* <div className="font-medium">{it.name || it.product_id}</div> */}
                      <div className="text-xs text-black">Qty: {it.quantity} × ₹{it.price}</div>
                    </div>
                    <div className="text-sm font-semibold text-black">₹{(it.quantity || 0) * (it.price || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
