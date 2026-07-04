import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { fetchCart } from '../store/cartSlice';
import { cartAPI } from '../api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, accessToken } = useSelector(state => state.auth);
  const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (accessToken) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      // Merge guest cart
      if (guestCart.length > 0) {
        try {
          await cartAPI.merge({ items: guestCart.map(i => ({ product_id: i.product_id, quantity: i.quantity })) });
          localStorage.removeItem('guestCart');
        } catch {}
      }
      dispatch(fetchCart());
      toast.success('Login berhasil!');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <span className="text-3xl">🥩</span> Triple-F Store
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Masuk ke Akun Anda</h1>
          <p className="text-gray-500 text-sm mt-1">Selamat datang kembali!</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Masukkan password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.rememberMe} onChange={e => setForm({ ...form, rememberMe: e.target.checked })} className="rounded" />
                Ingat saya
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Lupa password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
