"use client";

import { motion } from "framer-motion";

export default function CartItem({ item, onUpdate, onRemove }: { item: any; onUpdate?: any; onRemove?: any }) {
  return (
    <motion.div layout className="card flex items-center justify-between">
      <div>
        <div className="font-semibold text-black">{item.name || item.product_id}</div>
        <div className="text-sm">Qty: {item.quantity}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="font-medium">₹{item.price}</div>
        <button onClick={() => onRemove && onRemove(item.product_id)} className="btn btn-ghost">Remove</button>
      </div>
    </motion.div>
  );
}
