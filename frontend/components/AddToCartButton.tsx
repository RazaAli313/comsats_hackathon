"use client";

import { useState } from "react";
import api from "../services/api";

export default function AddToCartButton({ productId, price }: { productId: string; price: number }) {
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    try {
      await api.addToCart(productId, 1, price);
      alert("Added to cart");
    } catch (err: any) {
      alert(err?.info?.detail || err.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={add} className="btn btn-primary" disabled={loading}>
      {loading ? "Adding..." : "Add to cart"}
    </button>
  );
}
