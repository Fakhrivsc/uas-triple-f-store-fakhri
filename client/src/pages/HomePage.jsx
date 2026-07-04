import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryAPI, productAPI } from '../api';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';

// Hero slideshow images — all from client/public/images/
const HERO_SLIDES = [
  {
    src: '/images/daging%20steak.jpg.jpeg',
    label: 'Daging Steak Premium',
  },
  {
    src: '/images/iga%20backribs.jpg.jpeg',
    label: 'Iga Backribs Segar',
  },
  {
    src: '/images/buntut%20sapi%20super%20500gram.jpg.jpeg',
    label: 'Buntut Sapi Super',
  },
  {
    src: '/images/daging%20semur%20500gram.jpg.jpeg',
    label: 'Daging Semur',
  },
  {
    src: '/images/iga%20neckbone%20special%20500gram.jpg.jpeg',
    label: 'Iga Neckbone Special',
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slideshow state
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  // Auto-advance every 4.5 s
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Smooth fade transition helper
  const goTo = (indexOrUpdater) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(indexOrUpdater);
      setFading(false);
    }, 400); // half of CSS transition duration
  };

  const prev = () => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => goTo((current + 1) % HERO_SLIDES.length);

  useEffect(() => {
    Promise.all([
      categoryAPI.getAll(),
      productAPI.getAll({ limit: 8, sort: 'created_at', order: 'DESC' })
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data.data.categories);
      setFeaturedProducts(prodRes.data.data.products);
    }).finally(() => setLoading(false));
  }, []);

  const categoryEmojis = { 'Daging Segar': '🥩', 'Daging Olahan': '🌭', 'Jeroan': '🫀', 'Daging Beku': '🧊' };

  return (
    <div>
      {/* ── Hero Slideshow ─────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '520px' }}>

        {/* Slide images — stacked, only active one is visible */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== current}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("${slide.src}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === current && !fading ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: i === current ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay for text legibility */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white border border-white/30 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              🥩 Premium Quality Beef
            </span>

            {/* Headline */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 text-white"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              Daging Sapi Premium,<br />
              <span style={{ color: '#D4AF37' }}>Langsung ke Pintu Anda</span>
            </h1>

            {/* Sub */}
            <p className="text-white/85 text-lg mb-8 leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              Nikmati kemudahan berbelanja daging sapi segar berkualitas tinggi. Dipilih langsung dari peternak terpercaya, dikirim dalam kondisi terbaik.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: '#D4AF37', boxShadow: '0 4px 20px rgba(212,175,55,0.45)' }}
              >
                Belanja Sekarang <ArrowRight size={18} />
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-white border border-white/50 backdrop-blur-sm hover:bg-white/15 transition-all duration-200"
              >
                Lihat Katalog
              </Link>
            </div>

            {/* Slide label */}
            <p className="mt-8 text-white/50 text-xs tracking-widest uppercase">
              {HERO_SLIDES[current].label}
            </p>
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          aria-label="Slide sebelumnya"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={next}
          aria-label="Slide berikutnya"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: i === current ? '28px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: i === current ? '#D4AF37' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.35s ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Kualitas Terjamin', desc: 'Daging segar pilihan setiap hari' },
              { icon: Truck, title: 'Pengiriman Cepat', desc: 'Sampai dalam kondisi segar' },
              { icon: Clock, title: 'Pesan Mudah', desc: 'Proses cepat & aman' },
              { icon: Star, title: 'Terpercaya', desc: 'Ribuan pelanggan puas' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Kategori Produk</h2>
          <Link to="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          )) : categories.map(cat => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30 group rounded-xl"
            >
              <div className="h-24 overflow-hidden bg-gray-100">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-4xl">
                    {categoryEmojis[cat.name] || '🥩'}
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-gray-800 text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.product_count} produk</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Produk Unggulan</h2>
          <Link to="/products" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) :
            featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* How to Order */}
      <section className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">Cara Berbelanja</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pilih Produk', desc: 'Jelajahi katalog daging premium kami dan tambahkan ke keranjang belanja Anda.', emoji: '🛒' },
              { step: '02', title: 'Checkout & Bayar', desc: 'Pilih alamat pengiriman, kurir, dan metode pembayaran yang Anda inginkan.', emoji: '💳' },
              { step: '03', title: 'Terima Pesanan', desc: 'Pesanan Anda dikemas dengan higienis dan dikirim langsung ke pintu Anda.', emoji: '📦' }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{s.emoji}</div>
                <div className="inline-block bg-primary text-white text-sm font-bold px-3 py-1 rounded-full mb-3">Langkah {s.step}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
