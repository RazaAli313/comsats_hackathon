"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../services/api";

export default function AddToCartButton({ productId, price, stock, className }: { productId: string; price: number; stock?: number; className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function add() {
    if (typeof stock !== 'undefined' && stock <= 0) {
      toast.error('This item is out of stock');
      return;
    }
    setLoading(true);
    try {
      // double-check server-side availability before adding (best-effort)
      try {
        const prod = await api.getProduct(productId);
        if (prod && typeof prod.stock !== 'undefined' && prod.stock <= 0) {
          toast.error('This item is out of stock');
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore fetch error and try add
      }
      await api.addToCart(productId, 1, price);
      // Friendly toast with CTA to go to checkout
      toast((t) => (
        <div className="flex items-center gap-4">
          <div className="flex-1">Added to cart</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push("/checkout");
              }}
              className="px-3 py-1 bg-emerald-600 text-white rounded"
            >
              Go to checkout
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-200 text-black rounded"
            >
              Close
            </button>
          </div>
        </div>
      ));
      // Notify other UI pieces (Navbar) that cart may have changed
      try {
        window.dispatchEvent(new CustomEvent("cart:changed"));
      } catch (e) {}
    } catch (err: any) {
      const msg = err?.info?.detail ? (typeof err.info.detail === 'string' ? err.info.detail : JSON.stringify(err.info.detail)) : (err?.message || 'Failed to add to cart');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={add} className={className || "btn btn-primary"} disabled={loading || (typeof stock !== 'undefined' && stock <= 0)}>
      {loading ? "Adding..." : (typeof stock !== 'undefined' && stock <= 0 ? 'Out of stock' : 'Add to cart')}
    </button>
  );
}
