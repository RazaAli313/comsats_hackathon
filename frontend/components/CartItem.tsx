export default function CartItem({ item, onUpdate, onRemove }: { item: any; onUpdate?: any; onRemove?: any }) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <div className="font-semibold">{item.name || item.product_id}</div>
        <div className="muted text-sm">Qty: {item.quantity}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="font-medium">₹{item.price}</div>
        <button onClick={() => onRemove && onRemove(item.product_id)} className="btn btn-ghost">Remove</button>
      </div>
    </div>
  );
}
