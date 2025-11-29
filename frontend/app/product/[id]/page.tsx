import React from "react";
import api from "../../../services/api";
import AddToCartButton from "../../../components/AddToCartButton";

export default async function ProductDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = (resolvedParams as any).id;
  const data = await api.getProduct(id);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <p className="muted mt-3">{data.description}</p>
        <div className="mt-6 flex items-center gap-6">
          <div className="text-2xl font-extrabold">₹{data.price}</div>
          <AddToCartButton productId={data.id} price={data.price} />
        </div>
      </div>
    </div>
  );
}
