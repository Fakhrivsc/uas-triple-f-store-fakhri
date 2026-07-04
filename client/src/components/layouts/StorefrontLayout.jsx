import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { settingsAPI } from '../../api';

export default function StorefrontLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    settingsAPI.get().then(res => {
      const s = res.data.data.settings;
      if (s.announcement_active === 'true' && s.announcement_text) {
        setAnnouncement(s.announcement_text);
      }
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-gold text-white text-center py-2 px-4 text-sm font-medium">
          🎉 {announcement}
        </div>
      )}

      {/* Header */}
      <header className="bg-primary shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
              <span className="text-2xl">🥩</span>
              <span className="hidden sm:block">Triple-F Store</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari produk daging..."
                  className="w-full pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/products" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Produk</Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium"
                  >
                    <User size={18} />
                    <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Profil Saya</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Pesanan Saya</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-primary font-medium hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Admin Panel</Link>
                      )}
                      <hr className="my-1" />
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Keluar</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium">Masuk</Link>
              )}

              <Link to="/wishlist" className="relative text-white/80 hover:text-white">
                <Heart size={22} />
              </Link>

              <Link to="/cart" className="relative text-white/80 hover:text-white">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-3">
              <Link to="/cart" className="relative text-white">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-primary-600 border-t border-primary-400">
            <div className="px-4 py-3">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari produk..." className="w-full pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none" />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"><Search size={18} /></button>
                </div>
              </form>
              <Link to="/products" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Produk</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Profil</Link>
                  <Link to="/orders" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Pesanan</Link>
                  <Link to="/wishlist" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                  {user?.role === 'admin' && <Link to="/admin/dashboard" className="block py-2 text-gold" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-red-300 hover:text-red-200">Keluar</button>
                </>
              ) : (
                <Link to="/login" className="block py-2 text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>Masuk / Daftar</Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🥩</span>
                <span className="text-xl font-bold">Triple-F Store</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Daging sapi premium berkualitas tinggi, langsung ke pintu Anda. Kami menyediakan berbagai pilihan daging segar, olahan, dan beku dengan standar kebersihan terjamin.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gold">Navigasi</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/" className="hover:text-white">Beranda</Link></li>
                <li><Link to="/products" className="hover:text-white">Produk</Link></li>
                <li><Link to="/cart" className="hover:text-white">Keranjang</Link></li>
                <li><Link to="/orders" className="hover:text-white">Pesanan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gold">Kontak</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">📍</span>
                  <span>TRIPLE-F Store Daging &amp; Frozen Food</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0">📞</span>
                  <a href="tel:089513260188" className="hover:text-white transition-colors">089513260188</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex-shrink-0">✉️</span>
                  <a href="mailto:miftahulkhairifakhri@gmail.com" className="hover:text-white transition-colors break-all">miftahulkhairifakhri@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/50">
            © 2024 Triple-F Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
