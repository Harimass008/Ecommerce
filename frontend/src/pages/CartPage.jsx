import CartItem from '../components/CartItem.jsx';
import OrderSummary from '../components/OrderSummary.jsx';

export default function CartPage({ cart, setCart, total, address, setAddress, busy, checkout, setPage }) {
  return <section className="dashboard-page"><div className="eyebrow">YOUR SELECTION</div><h1>Your shopping bag<span>.</span></h1>
    <div className="cart-layout"><div className="panel">
      {cart.length ? cart.map(item => <CartItem key={item._id} item={item} setCart={setCart}/>) : <div className="empty-state"><h3>Your bag is taking a break</h3><p>Find something you'll love in the marketplace.</p><button className="primary" onClick={() => setPage('shop')}>Explore products</button></div>}
    </div><OrderSummary total={total} address={address} setAddress={setAddress} cart={cart} busy={busy} checkout={checkout}/></div>
  </section>;
}
