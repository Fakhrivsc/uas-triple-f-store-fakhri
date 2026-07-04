import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { initialized, accessToken } = useSelector(state => state.auth);
  const location = useLocation();

  // Still waiting for fetchMe to complete
  if (accessToken && !initialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
