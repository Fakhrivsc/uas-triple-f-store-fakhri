import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <span className="text-3xl">🥩</span> Triple-F Store
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Lupa Password</h1>
          <p className="text-gray-500 text-sm mt-1">Masukkan email Anda untuk reset password</p>
        </div>

        <div className="card p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Terkirim!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Jika email <strong>{email}</strong> terdaftar, Anda akan menerima instruksi reset password.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="email@contoh.com"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Kirim Link Reset</button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
