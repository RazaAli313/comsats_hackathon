"use client";

import { useState } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function formatError(err: any) {
  if (!err) return "An error occurred";
  if (typeof err === "string") return err;
  if (err?.info?.detail) {
    return typeof err.info.detail === "string" ? err.info.detail : JSON.stringify(err.info.detail);
  }
  if (err.message) return String(err.message);
  return JSON.stringify(err);
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function validate() {
    if (!username.trim()) return "Enter a username";
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      await api.register(username.trim(), email.trim(), password);
      toast.success("Account created — please sign in");
      router.push("/login");
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
        <p className="text-sm text-zinc-600 mb-6">Join ShopMart — secure checkout, track orders and more.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 mt-1 border rounded-md" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 mt-1 border rounded-md" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 mt-1 border rounded-md" />
            <p className="text-xs text-zinc-500 mt-1">Minimum 6 characters</p>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex items-center justify-between gap-4">
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => router.push('/login')}>Already have an account?</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
