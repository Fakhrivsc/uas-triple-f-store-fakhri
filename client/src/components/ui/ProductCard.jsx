import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency, getImageUrl } from '../../utils/format';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { wishlistAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onWishlistChange }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Silakan login terlebih dahulu'); return; }
    try {
      await wishlistAPI.add(product.id);
      toast.success('Ditambahkan ke wishlist');
      onWishlistChange?.();
    } catch (err) {
      if (err.response?.status === 409) {
        await wishlistAPI.remove(product.id);
        toast.success('Dihapus dari wishlist');
        onWishlistChange?.();
      } else {
        toast.error('Gagal memperbarui wishlist');
      }
    }
  };

  const displayPrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price;
  const discountPct = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;

  return (
    <Link to={`/products/${product.slug}`} className="card group hover:shadow-lg transition-all duration-300 overflow-hidden block rounded-xl">
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={product.images?.[0] ? getImageUrl(product.images[0]) : getImageUrl(null)}
          alt={product.name}
          className="w-full h-56 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            // Fallback to first available public image
            const fallbackSrc = getImageUrl(null);
            if (!e.target.src.endsWith(fallbackSrc)) {
              e.target.src = fallbackSrc;
            }
          }}
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Stok Terbatas
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Habis</span>
          </div>
        )}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 leading-tight">{product.name}</h3>

        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-gold fill-gold" />
          <span className="text-xs text-gray-500">4.5</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-primary text-sm">{formatCurrency(displayPrice)}</p>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
            )}
          </div>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white rounded-lg p-1.5 hover:bg-primary-600 transition-colors"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
