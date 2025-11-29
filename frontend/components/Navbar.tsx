"use client";

import { useEffect, useState } from "react";
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
    <header className="border-b border-black/[.06] bg-transparent py-4">
      <div className="container mx-auto flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg font-semibold tracking-tight">
            Metadots
          </a>
          <a href="/products" className="text-sm hover:underline">
            Products
          </a>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="muted">{user.username}</span>
              <button onClick={handleLogout} className="btn btn-ghost">
                Sign out
              </button>
            </>
          ) : (
            <a href="/login" className="hover:underline">
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
