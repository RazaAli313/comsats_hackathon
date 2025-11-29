"use client";

import { useState } from "react";
import api from "../../services/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      }).then(async (r) => {
        if (!r.ok) throw new Error('Registration failed');
        router.push('/login');
      })
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-md">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 border rounded-md" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-md" />
        <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-md" />
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <button className="btn btn-primary" type="submit">Sign up</button>
        </div>
      </form>
    </div>
  )
}
