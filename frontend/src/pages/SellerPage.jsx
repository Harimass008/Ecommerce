import OrdersTable from '../components/OrdersTable.jsx';
import ProductForm from '../components/ProductForm.jsx';
import SellerProductList from '../components/SellerProductList.jsx';
export default function SellerPage({ productForm, setProductForm, createProduct, busy, myProducts, orders, updateOrder, user }) {
  return <section className="dashboard-page"><div className="eyebrow">SELLER STUDIO</div><h1>Your store, your story<span>.</span></h1><p className="page-lead">Create product listings and manage customer orders.</p>
    <div className="seller-layout"><ProductForm productForm={productForm} setProductForm={setProductForm} createProduct={createProduct} busy={busy}/><SellerProductList products={myProducts}/></div>
    <div className="panel orders-panel"><h3>Incoming orders</h3><OrdersTable orders={orders} onUpdate={updateOrder} role={user?.role}/></div>
  </section>;
}
