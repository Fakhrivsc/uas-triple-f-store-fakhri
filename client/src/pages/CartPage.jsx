import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItem, removeCartItem } from '../store/cartSlice';
import { updateGuestCartItem, removeFromGuestCart } from '../store/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, getImageUrl } from '../utils/format';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, total, guestCart } = useSelector(state => state.cart);

  const cartItems = isAuthenticated ? items : guestCart;

  const guestTotal = guestCart.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  const displayTotal = isAuthenticated ? total : guestTotal;

  const handleQtyChange = (item, newQty) => {
    if (isAuthenticated) {
      if (newQty <= 0) dispatch(removeCartItem(item.id));
      else dispatch(updateCartItem({ itemId: item.id, quantity: newQty }));
    } else {
      if (newQty <= 0) dispatch(removeFromGuestCart(item.product_id));
      else dispatch(updateGuestCartItem({ productId: item.product_id, quantity: newQty }));
    }
  };

  const handleRemove = (item) => {
    if (isAuthenticated) dispatch(removeCartItem(item.id));
    else dispatch(removeFromGuestCart(item.product_id));
  };

  if (cartItems.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-7xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Keranjang Kosong</h2>
      <p className="text-gray-500 mb-6">Belum ada produk di keranjang Anda</p>
      <Link to="/products" className="btn-primary inline-flex items-center gap-2">
        <ShoppingBag size={18} /> Mulai Belanja
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang Belanja ({cartItems.length} item)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map(item => {
            const product = item.product;
            const price = parseFloat(product?.discount_price || product?.price || 0);
            return (
              <div key={item.id || item.product_id} className="card p-4 flex gap-4">
                <Link to={`/products/${product?.slug}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={product?.images?.[0] ? getImageUrl(product.images[0]) : 'https://placehold.co/80x80/1B4332/white?text=🥩'}
                    alt={product?.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://placehold.co/80x80/1B4332/white?text=🥩'; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product?.slug}`} className="font-medium text-gray-800 hover:text-primary line-clamp-2 text-sm">{product?.name}</Link>
                  <p className="text-xs text-gray-500 mt-1">{product?.weight_gram}g / {product?.unit}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => handleQtyChange(item, item.quantity - 1)} className="p-1.5 hover:bg-gray-50 rounded-l-lg"><Minus size={14} /></button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 rounded-r-lg"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">{formatCurrency(price * item.quantity)}</span>
                      <button onClick={() => handleRemove(item)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span>{formatCurrency(displayTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkos Kirim</span>
              <span className="text-green-600">Dihitung saat checkout</span>
            </div>
          </div>
          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(displayTotal)}</span>
            </div>
          </div>
          <button
            onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login', { state: { from: { pathname: '/checkout' } } })}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            Lanjut ke Checkout <ArrowRight size={18} />
          </button>
          <Link to="/products" className="block text-center text-sm text-primary hover:underline mt-3">Lanjut Belanja</Link>
        </div>
      </div>
    </div>
  );
}
