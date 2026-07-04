import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, ShoppingBag, Camera, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api';
import { getImageUrl } from '../utils/format';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateMe(form);
      dispatch(setUser(res.data.data.user));
      toast.success('Profil berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await userAPI.updateAvatar(fd);
      dispatch(setUser({ ...user, avatar_url: res.data.data.avatar_url }));
      toast.success('Avatar berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui avatar');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Konfirmasi password tidak cocok'); return; }
    setSavingPw(true);
    try {
      await userAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password berhasil diubah');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-4">
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary mx-auto">
                  {user?.avatar_url ? (
                    <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer hover:bg-gray-50">
                  <Camera size={14} className="text-gray-600" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <p className="font-semibold text-sm mt-2">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                <User size={16} /> Profil
              </Link>
              <Link to="/profile/addresses" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
                <MapPin size={16} /> Alamat
              </Link>
              <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
                <ShoppingBag size={16} /> Pesanan
              </Link>
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="md:col-span-3 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Informasi Pribadi</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={user?.email} disabled className="input-field bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>
              <button type="submit" disabled={saving} className="btn-primary px-6">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </form>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Ubah Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'current_password', label: 'Password Saat Ini' },
                { key: 'new_password', label: 'Password Baru' },
                { key: 'confirm', label: 'Konfirmasi Password Baru' }
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                      className="input-field pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={savingPw} className="btn-primary px-6">{savingPw ? 'Menyimpan...' : 'Ubah Password'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
