import UserRoleRow from './UserRoleRow.jsx';
export default function UserAccessPanel({ users, changeRole }) {
  return <div className="panel orders-panel"><h3>User access management</h3>
    {Array.isArray(users) && users.length ? users.map(user => <UserRoleRow key={user._id} user={user} onChangeRole={changeRole}/>) : <p className="muted-note">Loading users or no users found.</p>}
  </div>;
}
