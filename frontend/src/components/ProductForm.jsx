export default function ProductForm({ productForm, setProductForm, createProduct, busy }) {
  return <div className="panel"><h3>List a product</h3><form className="stack-form" onSubmit={createProduct}>
    <label>Product name<input required maxLength="140" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}/></label>
    <div className="two-fields"><label>Category<input required value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}/></label><label>Price (INR)<input required type="number" min="0" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })}/></label></div>
    <div className="two-fields"><label>Stock<input required type="number" min="0" step="1" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })}/></label><label>Image URL (optional)<input value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}/></label></div>
    <label>Description<textarea rows="3" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}/></label>
    <button className="primary" disabled={busy}>Publish product ↗</button>
  </form></div>;
}
