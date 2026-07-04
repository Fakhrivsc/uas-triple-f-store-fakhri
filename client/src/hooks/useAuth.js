import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import { authAPI } from '../api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, loading, error } = useSelector(state => state.auth);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    dispatch(logout());
    dispatch(clearCart());
  };

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated: !!accessToken && !!user,
    isAdmin: user?.role === 'admin',
    logout: handleLogout
  };
};
