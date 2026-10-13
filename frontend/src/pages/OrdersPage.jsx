import OrdersTable from '../components/OrdersTable.jsx';
export default function OrdersPage(props) {
 const { user, orders, updateOrder } = props;

 return (<><section className="dashboard-page"><div className="eyebrow">ORDER HISTORY</div><h1>Good things are on their way<span>.</span></h1><div className="panel orders-panel"><OrdersTable orders={orders} onUpdate={updateOrder} role={user?.role}/>{!user&&<p className="muted-note">Sign in to see your orders.</p>}</div></section></>);
}
