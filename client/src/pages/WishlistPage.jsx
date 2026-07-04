import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { wishlistAPI } from '../api';
import { formatCurrency, getImageUrl } from '../utils/format';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = () => {
    wishlistAPI.getAll().then(res => setWishlist(res.data.data.wishlist)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success('Dihapus dari wishlist');
      fetchWishlist();
    } catch { toast.error('Gagal menghapus dari wishlist'); }
  };

  const handleMoveToCart = (item) => {
    addToCart(item.product, 1);
    handleRemove(item.product_id);
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Wishlist Saya ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Wishlist Kosong</h3>
          <p className="text-gray-500 text-sm mb-4">Tambahkan produk favorit Anda ke wishlist</p>
          <Link to="/products" className="btn-primary">Jelajahi Produk</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {wishlist.map(item => {
            const product = item.product;
            const price = product?.discount_price || product?.price;
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link to={`/products/${product?.slug}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={product?.images?.[0] ? getImageUrl(product.images[0]) : 'https://placehold.co/80x80/1B4332/white?text=🥩'}
                    alt={product?.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://placehold.co/80x80/1B4332/white?text=🥩'; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product?.slug}`} className="font-medium text-sm text-gray-800 hover:text-primary line-clamp-2">{product?.name}</Link>
                  <p className="text-xs text-gray-500 mt-1">{product?.category?.name}</p>
                  <p className="font-bold text-primary mt-1">{formatCurrency(price)}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleMoveToCart(item)} className="flex items-center gap-1 text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-600">
                      <ShoppingCart size={12} /> Ke Keranjang
                    </button>
                    <button onClick={() => handleRemove(item.product_id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
