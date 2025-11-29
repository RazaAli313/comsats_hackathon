"use client";

import { useState } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.login(email, password);
      // redirect to home or last page
      router.push("/");
    } catch (err: any) {
      setError(err?.info?.detail || err.message || "Login failed");
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-md">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-md" />
        <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-md" />
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
