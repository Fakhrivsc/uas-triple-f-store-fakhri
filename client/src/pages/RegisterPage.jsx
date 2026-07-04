import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, accessToken } = useSelector(state => state.auth);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (accessToken) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [accessToken]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email) errs.email = 'Email wajib diisi';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Konfirmasi password tidak cocok';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registrasi berhasil! Selamat datang!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <span className="text-3xl">🥩</span> Triple-F Store
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-1">Bergabung dan nikmati kemudahan belanja daging premium</p>
        </div>

        <div className="card p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap Anda' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com' },
              { key: 'phone', label: 'Nomor Telepon', type: 'tel', placeholder: '08xxxxxxxxxx' }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className={`input-field ${errors[field.key] ? 'border-red-400' : ''}`}
                  placeholder={field.placeholder}
                />
                {errors[field.key] && <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                className={`input-field ${errors.confirm_password ? 'border-red-400' : ''}`}
                placeholder="Ulangi password"
              />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
