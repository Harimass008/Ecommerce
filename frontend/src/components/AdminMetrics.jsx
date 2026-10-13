import { money } from '../utils.js';
export default function AdminMetrics({ overview }) {
  if (!overview) return null;
  const metrics = [['Users', overview.users], ['Sellers', overview.sellers], ['Active products', overview.products], ['Orders', overview.orders], ['Demo order value', money(overview.demoOrderValue)]];
  return <div className="metric-grid">{metrics.map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}
