import React from 'react';

export default function CancelPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Payment canceled</h1>
      <p className="mt-4">Your payment was canceled. You can try again or continue shopping.</p>
      <div className="mt-6">
        <a href="/cart" className="btn btn-ghost">Back to cart</a>
      </div>
    </div>
  )
}
