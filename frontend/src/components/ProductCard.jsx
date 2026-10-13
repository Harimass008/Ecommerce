import { money, fallbackImages } from '../utils.js';

export default function ProductCard({ product, index, onAdd }) {
  const image = fallbackImages[index % fallbackImages.length];
  return <article className="product-card">
    <div className="product-image"><img src={product.imageUrl || image} alt={product.name} onError={e => { e.currentTarget.src = image; }}/>
      <span className="product-category">{product.category}</span>
      <button className="quick-add" title="Add to cart" onClick={() => onAdd(product)}>+</button>
    </div>
    <div className="product-info"><div className="product-title-row"><h3>{product.name}</h3><strong>{money(product.price)}</strong></div>
      <p>{product.description || 'A great find from an independent seller.'}</p>
      <div className="seller-line"><span className="seller-dot"></span> Sold by {product.seller?.name || 'Marketplace seller'} <span className="stock-label">{product.stock > 0 ? 'In stock' : 'Out of stock'}</span></div>
      <button className="add-button" disabled={product.stock < 1} onClick={() => onAdd(product)}>{product.stock > 0 ? 'Add to bag' : 'Sold out'} <span>↗</span></button>
    </div>
  </article>;
}
