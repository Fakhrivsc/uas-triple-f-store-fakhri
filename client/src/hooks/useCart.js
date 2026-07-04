import { useSelector, useDispatch } from 'react-redux';
import { addToCart, fetchCart } from '../store/cartSlice';
import { addToGuestCart } from '../store/cartSlice';
import { useAuth } from './useAuth';

export const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, total, loading, guestCart } = useSelector(state => state.cart);

  const cartItems = isAuthenticated ? items : guestCart;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product, quantity = 1) => {
    if (isAuthenticated) {
      dispatch(addToCart({ product_id: product.id, quantity }));
    } else {
      dispatch(addToGuestCart({ product, quantity }));
    }
  };

  return { items: cartItems, total, loading, cartCount, addToCart: handleAddToCart };
};
