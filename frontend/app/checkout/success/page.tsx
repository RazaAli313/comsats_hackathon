import React from 'react';

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="mt-4">Thank you! Your payment was successful. We'll email you the receipt and order details shortly.</p>
      <div className="mt-6">
        <a href="/products" className="btn btn-primary">Continue shopping</a>
      </div>
    </div>
  )
}
