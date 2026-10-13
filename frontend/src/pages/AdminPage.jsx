import OrdersTable from '../components/OrdersTable.jsx';
import AdminMetrics from '../components/AdminMetrics.jsx';
import UserAccessPanel from '../components/UserAccessPanel.jsx';
export default function AdminPage({ overview, myProducts, changeRole, orders, updateOrder, user }) {
  return <section className="dashboard-page"><div className="eyebrow">MARKETPLACE CONTROL</div><h1>Admin overview<span>.</span></h1>
    <AdminMetrics overview={overview}/>
    <UserAccessPanel users={myProducts} changeRole={changeRole}/>
    <div className="panel orders-panel"><h3>Recent marketplace orders</h3><OrdersTable orders={orders} onUpdate={updateOrder} role={user?.role}/></div>
  </section>;
}
