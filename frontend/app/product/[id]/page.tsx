import React from "react";
import api from "../../../services/api";

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  const data = await api.getProduct(id);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="muted mt-3">{data.description}</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="text-lg font-bold">₹{data.price}</div>
        </div>
      </div>
    </div>
  );
}
