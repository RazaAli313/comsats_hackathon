"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .me()
      .then((r: any) => mounted && setUser(r))
      .catch(() => mounted && setUser(null));
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
      setUser(null);
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="backdrop-blur-sm border-b border-black/[.04] bg-white/60 dark:bg-black/50 py-4"
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">SM</div>
            <span className="text-lg font-semibold tracking-tight">ShopMart</span>
          </a>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <a href="/" className="hover:underline">Home</a>
            <a href="/products" className="hover:underline">Products</a>
            <a href="/about" className="hover:underline">About</a>
            <a href="/contact" className="rounded-md px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-blue-600 text-white">Contact</a>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <a href="/cart" className="text-sm hover:underline">Cart</a>
          {user ? (
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
              <span className="muted">{user.username || user.email}</span>
              <button onClick={handleLogout} className="btn btn-ghost">
                Sign out
              </button>
            </motion.div>
          ) : (
            <a href="/login" className="hover:underline">Sign in</a>
          )}
        </div>
      </div>
    </motion.header>
  );
}
