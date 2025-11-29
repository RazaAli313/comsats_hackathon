"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success('Payment successful — thank you!');
    const t = setTimeout(() => {
      router.push('/products');
    }, 1800);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="mt-4">Thank you! Your payment was successful. We'll email you the receipt and order details shortly.</p>
      <div className="mt-6">
        <button onClick={() => router.push('/products')} className="btn btn-primary">Continue shopping</button>
      </div>
    </div>
  )
}
