"use client"

import React, { useEffect, useState } from "react"

type Insights = {
  users_count?: number
  products_count?: number
  orders_count?: number
  recent_orders?: Array<any>
}

export default function AdminInsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

  useEffect(() => {
    fetchInsights()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchInsights() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${base}/api/admin/insights`, { credentials: "include" })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setInsights(data)
    } catch (e: any) {
      setError(e.message || "Failed to load insights")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin — Insights</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {insights && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded shadow text-black" >
            <strong>Users:</strong> {insights.users_count ?? "—"}
          </div>
          <div className="p-4 bg-white rounded shadow text-black" >
            <strong>Products:</strong> {insights.products_count ?? "—"}
          </div>
          <div className="p-4 bg-white rounded shadow text-black" >
            <strong>Orders:</strong> {insights.orders_count ?? "—"}
          </div>
          <div>
            <h3 className="text-lg font-medium">Recent Orders</h3>
            <ul className="mt-2 space-y-2">
              {(insights.recent_orders || []).map((o: any) => (
                <li key={o.id || o._id} className="p-3 bg-gray-50 rounded text-black">
                  <div>Order: {o.id || o._id}</div>
                  <div>Total: {o.total_amount}</div>
                  <div>Status: {o.payment_status}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
