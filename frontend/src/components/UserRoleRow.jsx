export default function UserRoleRow({ user, onChangeRole }) {
  return <div className="mini-row" key={user._id}><div><strong>{user.name}</strong><small>{user.email}</small></div>
    <select value={user.role} onChange={e => onChangeRole(user._id, e.target.value)}><option value="customer">Customer</option><option value="seller">Seller</option><option value="admin">Admin</option></select>
  </div>;
}
