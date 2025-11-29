"use client";

import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AdminProductForm({ initial = {}, onSubmit }: { initial?: any; onSubmit: (p: any) => Promise<any> }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [price, setPrice] = useState(initial.price || 0);
  const [stock, setStock] = useState(initial.stock || 0);
  const [category, setCategory] = useState(initial.category || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let images: string[] = initial.images || [];
      if (file) {
        toast.loading('Uploading image...');
        const r = await api.uploadImage(file);
        images = [r.url, ...(images || [])];
        toast.dismiss();
        toast.success('Image uploaded');
      }

      await onSubmit({ name, description, price: Number(price), stock: Number(stock), category, images });
      // Clear form after successful create (if this is a create form)
      setName("");
      setDescription("");
      setPrice(0);
      setStock(0);
      setCategory("");
      setFile(null);
      setPreview(null);
      toast.success('Saved');
    } catch (err: any) {
      toast.error(err?.message || 'Save failed');
      throw err;
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-3 border rounded-md" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full p-3 border rounded-md" />
      <div>
        <label className="block text-sm font-medium mb-2">Image</label>
        <input type="file" accept="image/*" onChange={(e) => {
          const f = e.target.files ? e.target.files[0] : null;
          setFile(f);
          try { setPreview(f ? URL.createObjectURL(f) : null); } catch(e){}
        }} />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded" />
          </div>
        )}
        {!preview && initial.images && initial.images.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {initial.images.map((u: string) => (
              <img key={u} src={u} alt="existing" className="w-20 h-20 object-cover rounded" />
            ))}
          </div>
        )}
      </div>
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
