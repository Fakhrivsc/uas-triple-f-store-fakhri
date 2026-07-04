import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronRight, Minus, Plus, Send, CheckCircle } from 'lucide-react';
import { productAPI, wishlistAPI, reviewAPI } from '../api';
import { formatCurrency, getImageUrl, formatDate } from '../utils/format';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ui/ProductCard';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';

// ── Interactive star picker ──────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`${n} bintang`}
        >
          <Star
            size={28}
            className={n <= display ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500">
          {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][value]}
        </span>
      )}
    </div>
  );
}

// ── Rating summary bar ───────────────────────────────────────────────────────
function RatingSummary({ avgRating, total, distribution }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-xl mb-6">
      {/* Big number */}
      <div className="flex flex-col items-center justify-center min-w-[100px]">
        <span className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</span>
        <StarRating rating={Math.round(avgRating)} size={18} />
        <span className="text-xs text-gray-500 mt-1">{total} ulasan</span>
      </div>
      {/* Bars */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution?.find(d => d.star === star)?.count || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right text-gray-600">{star}</span>
              <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-gray-500 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review form ──────────────────────────────────────────────────────────────
function ReviewForm({ productId, orderId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Pilih rating bintang terlebih dahulu'); return; }
    if (!comment.trim()) { toast.error('Tulis komentar ulasan Anda'); return; }
    setSubmitting(true);
    try {
      const res = await reviewAPI.create({ product_id: productId, order_id: orderId, rating, comment: comment.trim() });
      toast.success('Ulasan berhasil dikirim!');
      onSuccess(res.data.data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Star size={18} className="text-yellow-400 fill-yellow-400" />
        Tulis Ulasan Anda
      </h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Komentar</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          className="input-field resize-none text-sm"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary flex items-center gap-2 px-6 py-2.5"
      >
        <Send size={15} />
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  );
}

// ── Single review card ───────────────────────────────────────────────────────
function ReviewCard({ review }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {review.user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-800">{review.user?.name}</span>
            <StarRating rating={review.rating} size={13} />
            <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('desc');
  const [inWishlist, setInWishlist] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null); // { eligible, reason, order_id }

  // Load product
  useEffect(() => {
    setLoading(true);
    productAPI.getBySlug(slug).then(res => {
      setProduct(res.data.data.product);
      setRelated(res.data.data.related);
      setActiveImg(0);
    }).finally(() => setLoading(false));
  }, [slug]);

  // Load reviews separately so they refresh independently
  const loadReviews = useCallback((productId) => {
    setReviewsLoading(true);
    reviewAPI.getByProduct(productId)
      .then(res => {
        setReviews(res.data.data.reviews);
        setAvgRating(res.data.data.avg_rating);
        setDistribution(res.data.data.distribution || []);
      })
      .finally(() => setReviewsLoading(false));
  }, []);

  useEffect(() => {
    if (!product) return;
    loadReviews(product.id);

    // Check eligibility if logged in
    if (isAuthenticated) {
      reviewAPI.checkEligibility(product.id)
        .then(res => setEligibility(res.data.data))
        .catch(() => setEligibility(null));
    }
  }, [product, isAuthenticated, loadReviews]);

  const handleAddToCart = () => { if (product) addToCart(product, qty); };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Silakan login terlebih dahulu'); return; }
    try {
      if (inWishlist) {
        await wishlistAPI.remove(product.id);
        setInWishlist(false);
        toast.success('Dihapus dari wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setInWishlist(true);
        toast.success('Ditambahkan ke wishlist');
      }
    } catch {}
  };

  const handleReviewSuccess = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    const newTotal = reviews.length + 1;
    const newAvg = (avgRating * reviews.length + newReview.rating) / newTotal;
    setAvgRating(newAvg);
    // Mark as already reviewed
    setEligibility(prev => ({ ...prev, eligible: false, reason: 'Anda sudah memberikan ulasan' }));
    setActiveTab('reviews');
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-xl" />
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-6 rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-xl font-semibold text-gray-700">Produk tidak ditemukan</h2>
      <Link to="/products" className="btn-primary mt-4 inline-block">Kembali ke Produk</Link>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [''];
  const displayPrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price;
  const discountPct = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0;
  const reviewCount = reviews.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary">Beranda</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-primary">Produk</Link>
        <ChevronRight size={14} />
        <Link to={`/products?category=${product.category?.id}`} className="hover:text-primary">{product.category?.name}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
            <img
              src={images[activeImg] ? getImageUrl(images[activeImg]) : getImageUrl(null)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = '/images/daging%20steak.jpg.jpeg'; }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${i === activeImg ? 'border-primary' : 'border-gray-200'}`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = '/images/daging%20steak.jpg.jpeg'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-sm text-primary font-medium">{product.category?.name}</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-1 mb-3">{product.name}</h1>

          {/* Rating summary inline */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={Math.round(avgRating)} size={16} />
            <span className="text-sm font-semibold text-gray-700">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
            <button
              onClick={() => setActiveTab('reviews')}
              className="text-sm text-primary hover:underline"
            >
              {reviewCount} ulasan
            </button>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-primary">{formatCurrency(displayPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">-{discountPct}%</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Berat</p>
              <p className="font-semibold">{product.weight_gram}g / {product.unit}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500">Stok</p>
              <p className={`font-semibold ${product.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                {product.stock === 0 ? 'Habis' : product.stock < 10 ? `Tersisa ${product.stock}` : 'Tersedia'}
              </p>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-50 rounded-l-lg"><Minus size={16} /></button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2 hover:bg-gray-50 rounded-r-lg"><Plus size={16} /></button>
              </div>
              <span className="text-sm text-gray-500">Maks. {product.stock}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
            <button
              onClick={handleWishlist}
              className={`p-3 border rounded-lg transition-colors ${inWishlist ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500'}`}
            >
              <Heart size={20} className={inWishlist ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Quick review CTA on product card */}
          {isAuthenticated && eligibility?.eligible && (
            <button
              onClick={() => setActiveTab('reviews')}
              className="mt-3 w-full flex items-center justify-center gap-2 border border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
              <Star size={15} className="fill-yellow-400 text-yellow-400" />
              Beri Ulasan Produk Ini
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-8">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'desc', label: 'Deskripsi' },
            { key: 'reviews', label: `Ulasan (${reviewCount})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Description tab ── */}
          {activeTab === 'desc' && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description || 'Tidak ada deskripsi.'}</p>
          )}

          {/* ── Reviews tab ── */}
          {activeTab === 'reviews' && (
            <div>
              {/* Rating summary */}
              {reviewCount > 0 && (
                <RatingSummary avgRating={avgRating} total={reviewCount} distribution={distribution} />
              )}

              {/* Review form — eligible user */}
              {!isAuthenticated && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-center">
                  <Star size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-600 text-sm mb-3">Login untuk memberikan ulasan</p>
                  <Link to="/login" className="btn-primary text-sm px-5 py-2">Masuk</Link>
                </div>
              )}

              {isAuthenticated && eligibility?.eligible && (
                <ReviewForm
                  productId={product.id}
                  orderId={eligibility.order_id}
                  onSuccess={handleReviewSuccess}
                />
              )}

              {isAuthenticated && eligibility && !eligibility.eligible && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
                  <CheckCircle size={18} className="flex-shrink-0" />
                  <span>{eligibility.reason}</span>
                </div>
              )}

              {/* Review list */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-32 rounded" />
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-3/4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviewCount === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Star size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Belum ada ulasan</p>
                  <p className="text-sm mt-1">Jadilah yang pertama mengulas produk ini</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Produk Terkait</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
