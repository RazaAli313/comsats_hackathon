"use client";

import { useState } from "react";

export default function AdminProductForm({ initial = {}, onSubmit }: { initial?: any; onSubmit: (p: any) => Promise<any> }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [price, setPrice] = useState(initial.price || 0);
  const [stock, setStock] = useState(initial.stock || 0);
  const [category, setCategory] = useState(initial.category || "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ name, description, price: Number(price), stock: Number(stock), category });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-3 border rounded-md" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-3 border rounded-md" />
      <div className="grid grid-cols-2 gap-4">
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="w-full p-3 border rounded-md" />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" className="w-full p-3 border rounded-md" />
      </div>
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full p-3 border rounded-md" />
      <div>
        <button className="btn btn-primary" type="submit">Save</button>
      </div>
    </form>
  );
}
