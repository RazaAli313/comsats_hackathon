"use client";

import { useState } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function formatError(err: any) {
  if (!err) return "An error occurred";
  if (typeof err === "string") return err;
  if (err?.info?.detail) return typeof err.info.detail === "string" ? err.info.detail : JSON.stringify(err.info.detail);
  if (err.message) return String(err.message);
  return JSON.stringify(err);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError('Enter your email');
    if (!password) return setError('Enter your password');

    setLoading(true);
    try {
      await api.login(trimmedEmail, password);
      try { window.dispatchEvent(new Event('auth:changed')); } catch (e) {}
      toast.success('Signed in');
      router.push("/");
    } catch (err: any) {
      const msg = formatError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-zinc-600 mb-6">Welcome back — access your cart, orders, and profile.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mt-1 border rounded-md" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 mt-1 border rounded-md" />
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex items-center justify-between gap-4">
            <button className="btn btn-primary flex-1" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => router.push('/signup')}>Create account</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
