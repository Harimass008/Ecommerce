import { Navigate, useLocation } from 'react-router-dom';

/** UI route guard. API endpoints must enforce the same permissions on the server. */
export default function ProtectedRoute({ user, allowedRoles, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" replace state={{ from: location, openLogin: true }} />;
  }
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace state={{ forbidden: true }} />;
  }
  return children;
}
