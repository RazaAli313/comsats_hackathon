"use client";

import { useEffect, useState } from "react";
import api from "../../../services/api";
import AdminProductForm from "../../../components/AdminProductForm";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { api.getProducts().then((r:any) => setProducts(r.items || [])) }, []);

  async function handleCreate(payload: any) {
    await api.createProduct(payload);
    const res = await api.getProducts();
    setProducts(res.items || []);
    alert("Created");
  }

  async function handleUpdate(id: string, payload: any) {
    await api.updateProduct(id, payload);
    const res = await api.getProducts();
    setProducts(res.items || []);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete product?")) return;
    await api.deleteProduct(id);
    setProducts(products.filter((p) => p.id !== id));
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Admin — Products</h1>

      <section className="mt-6 max-w-2xl">
        <h2 className="text-lg font-medium">Create product</h2>
        <AdminProductForm onSubmit={handleCreate} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Existing products</h2>
        <div className="mt-4 space-y-4">
          {products.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="muted text-sm">{p.category} • ₹{p.price}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost" onClick={() => setEditing(p)}>Edit</button>
                <button className="btn btn-ghost" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editing && (
        <div className="mt-8 max-w-2xl">
          <h3 className="text-lg font-medium">Edit: {editing.name}</h3>
          <AdminProductForm initial={editing} onSubmit={(payload) => handleUpdate(editing.id, payload)} />
        </div>
      )}
    </div>
  );
}
