export default function ProductCard({ product }: { product: any }) {
  return (
    <article className="card">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="muted text-sm mt-2">{product.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="font-medium">₹{product.price}</div>
        <a href={`/product/${product.id}`} className="text-sm text-blue-600">View</a>
      </div>
    </article>
  );
}
