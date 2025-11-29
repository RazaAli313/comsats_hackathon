import ProductCard from "../components/ProductCard";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default async function HomePage() {
  let items: any[] = [];
  try {
    const res = await fetch(`${BASE}/api/products?limit=6`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      items = data.items || [];
    }
  } catch (e) {
    // ignore fetch errors for dev
    items = [];
  }

  return (
    <div className="min-h-screen">
      <section className="hero bg-[var(--background)]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold">ShopMart — Beautiful shopping made simple</h1>
            <p className="muted mt-4">Browse our curated selection of products. Fast checkout, secure payments, and delightful UI.</p>
            <div className="mt-6 flex gap-4">
              <a href="/products" className="btn btn-primary">Shop now</a>
              <a href="/about" className="btn btn-ghost">Learn more</a>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold">Featured products</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 && <div className="muted">No products available.</div>}
          {items.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
