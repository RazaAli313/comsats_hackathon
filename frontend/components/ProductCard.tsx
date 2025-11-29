"use client";

import { motion } from "framer-motion";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: any }) {
  const id = product.id ?? product._id ?? (product._id && String(product._id));
  return (
    <motion.article
      layout
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="muted text-sm mt-2 line-clamp-3">{product.description}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="font-medium text-xl">₹{product.price}</div>
          <div className="muted text-sm">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
          <div className="flex items-center gap-2 mt-2">
            {product.stock > 0 && <AddToCartButton productId={id} price={product.price} />}
            <a href={`/product/${id}`} className="text-sm text-blue-600">View</a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
