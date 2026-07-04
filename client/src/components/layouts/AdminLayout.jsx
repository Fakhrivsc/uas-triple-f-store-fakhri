import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, CreditCard,
  Users, Truck, Settings, Menu, X, LogOut, Star, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Produk' },
  { path: '/admin/categories', icon: Tag, label: 'Kategori' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
  { path: '/admin/payments', icon: CreditCard, label: 'Pembayaran' },
  { path: '/admin/users', icon: Users, label: 'Pengguna' },
  { path: '/admin/reviews', icon: Star, label: 'Ulasan' },
  { path: '/admin/settings', icon: Settings, label: 'Pengaturan' }
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-primary text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-primary-400">
          {sidebarOpen && (
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-xl">🥩</span>
              <span className="font-bold text-sm">Triple-F Admin</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/70 hover:text-white ml-auto">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${active ? 'bg-primary-400 text-white font-medium' : 'text-white/70 hover:bg-primary-600 hover:text-white'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-primary-400 p-4">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Link to="/" className="flex-1 text-center text-xs text-white/60 hover:text-white py-1" title="Lihat Toko">
              🏪
            </Link>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-1 text-xs text-white/60 hover:text-red-300 py-1" title="Keluar">
              <LogOut size={14} />
              {sidebarOpen && 'Keluar'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Admin Panel'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Halo, {user?.name?.split(' ')[0]}</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
