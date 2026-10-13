import { money } from '../utils.js';
export default function OrderSummary({ total, address, setAddress, cart, busy, checkout }) {
  return <aside className="panel summary-panel"><h3>Order summary</h3>
    <div className="summary-line"><span>Subtotal</span><strong>{money(total)}</strong></div>
    <div className="summary-line"><span>Shipping</span><span>Calculated later</span></div>
    <div className="summary-line total-line"><span>Total</span><strong>{money(total)}</strong></div>
    <label className="field-label">Shipping address<textarea rows="3" value={address} onChange={e => setAddress(e.target.value)} placeholder="Full delivery address"/></label>
    <p className="muted-note">Demo checkout only. No payment will be collected.</p>
    <button className="primary full" disabled={!cart.length || busy} onClick={checkout}>{busy ? 'Placing order…' : 'Place demo order'} <span>↗</span></button>
  </aside>;
}
