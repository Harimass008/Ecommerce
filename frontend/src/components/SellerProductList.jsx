import { money } from '../utils.js';
export default function SellerProductList({ products }) {
  return <div className="panel"><h3>Your listed products</h3>{products.length ? products.map(p => <div className="mini-row" key={p._id}><div><strong>{p.name}</strong><small>{p.category} · {p.stock} in stock</small></div><strong>{money(p.price)}</strong></div>) : <p className="muted-note">No products loaded yet. Your own listings will appear here.</p>}</div>;
}
