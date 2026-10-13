import { money, fallbackImages } from '../utils.js';

export default function CartItem({ item, setCart }) {
  return <div className="cart-item"><img src={item.imageUrl || fallbackImages[0]} alt={item.name}/>
    <div className="cart-item-info"><strong>{item.name}</strong><span>{money(item.price)} each</span>
      <div className="qty-controls">
        <button onClick={() => setCart(current => current.map(x => x._id === item._id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))}>−</button>
        <span>{item.quantity}</span>
        <button onClick={() => setCart(current => current.map(x => x._id === item._id ? { ...x, quantity: Math.min(x.quantity + 1, item.stock) } : x))}>+</button>
        <button className="remove" onClick={() => setCart(current => current.filter(x => x._id !== item._id))}>Remove</button>
      </div>
    </div><strong>{money(item.price * item.quantity)}</strong>
  </div>;
}
