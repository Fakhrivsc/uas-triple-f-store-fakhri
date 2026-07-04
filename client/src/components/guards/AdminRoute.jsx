import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { initialized, accessToken } = useSelector(state => state.auth);

  // Still waiting for fetchMe to complete
  if (accessToken && !initialized) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
