"use client"

import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"

type User = {
  _id: string
  email?: string
  username?: string
  role?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${base}/api/admin/users`, { credentials: "include" })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      // API returns { users: [...], total }
      setUsers(data.users || [])
    } catch (e: any) {
      setError(e.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  // create new user
  const [newUsername, setNewUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("user")

  async function createUser() {
    setError(null)
    try {
      const res = await fetch(`${base}/api/admin/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, email: newEmail, password: newPassword, role: newRole }),
      })
      if (!res.ok) throw new Error(await res.text())
      setNewUsername("")
      setNewEmail("")
      setNewPassword("")
      setNewRole("user")
      await fetchUsers()
      toast.success("User created")
    } catch (e: any) {
      toast.error(e.message || "Create failed")
      setError(e.message || "Create failed")
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user and associated data?")) return
    try {
      const res = await fetch(`${base}/api/admin/users/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) throw new Error(await res.text())
      await fetchUsers()
    } catch (e: any) {
      toast.error(e.message || "Delete failed")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin — Users</h1>
      <div className="mb-6 p-4 bg-white rounded shadow text-black">
        <h2 className="font-medium mb-2">Create new user</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" className="p-2 border rounded" />
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="p-2 border rounded" />
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="p-2 border rounded" />
          <div className="flex gap-2">
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="p-2 border rounded">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={createUser} className="px-4 py-2 bg-emerald-600 text-white rounded">Create</button>
          </div>
        </div>
      </div>
      {loading && <div>Loading users…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !users.length && <div>No users found.</div>}
      {users.length > 0 && (
        <table className="min-w-full bg-white border text-black">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2 text-sm">{u.id}</td>
                <td className="px-4 py-2 text-sm">{u.email || "—"}</td>
                <td className="px-4 py-2 text-sm">{u.username || "—"}</td>
                <td className="px-4 py-2 text-sm">{u.role || "user"}</td>
                <td className="px-4 py-2 text-sm">
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
