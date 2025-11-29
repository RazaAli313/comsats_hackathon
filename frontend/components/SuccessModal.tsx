"use client";

import { motion } from "framer-motion";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  orderId?: string | null;
  onClose: () => void;
  continueHref?: string;
};

export default function SuccessModal({ open, title = "Order placed", message = "Your order was placed successfully.", orderId, onClose, continueHref = "/products" }: Props) {
  if (!open) return null;

  function handleContinue() {
    try { window.dispatchEvent(new Event('cart:changed')); } catch (e) {}
    if (continueHref) window.location.href = continueHref;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-black/90 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-zinc-600 mt-2">{message}</p>
            {orderId && <p className="text-xs text-zinc-500 mt-3">Order ID: <span className="font-mono">{orderId}</span></p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700">✕</button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleContinue} className="btn btn-primary">Continue shopping</button>
        </div>
      </motion.div>
    </div>
  );
}
