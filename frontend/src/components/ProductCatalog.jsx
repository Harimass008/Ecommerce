import ProductCard from './ProductCard.jsx';

export default function ProductCatalog({ products, search, setSearch, categories, category, setCategory, addToCart }) {
  return <section id="catalog" className="catalog">
    <div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>Shop the marketplace<span>.</span></h2><p>Fresh finds from independent stores.</p></div>
      <label className="searchbox"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."/></label>
    </div>
    <div className="category-row">{categories.map(c => <button key={c} className={category === c ? 'category-active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
    <div className="product-grid">{products.map((product, index) => <ProductCard key={product._id} product={product} index={index} onAdd={addToCart}/>)}</div>
    {products.length === 0 && <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try another search, or be the first seller to list something.</p></div>}
  </section>;
}
