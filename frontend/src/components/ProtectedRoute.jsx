import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoute = ({ roles }) => {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <p role="status" className="p-8 text-muted">
        Checking your session…
      </p>
    );
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
