"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getProducts({ q: q || undefined, sort: sort || undefined })
      .then((r: any) => mounted && setItems(r.items || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [q, sort]);

  if (loading) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Products</h1>

      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-full p-3 border rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="p-2 border rounded-md">
            <option value="">Sort</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}