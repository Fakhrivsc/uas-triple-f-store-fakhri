import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { settingsAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    settingsAPI.get().then(res => setSettings(res.data.data.settings)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(settings).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v); });
      if (logoFile) fd.append('logo', logoFile);
      await settingsAPI.update(fd);
      toast.success('Pengaturan berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Pengaturan Toko</h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Informasi Toko</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
              <input type="text" value={settings.store_name || ''} onChange={e => set('store_name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input type="text" value={settings.store_phone || ''} onChange={e => set('store_phone', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={settings.store_email || ''} onChange={e => set('store_email', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional</label>
              <input type="text" value={settings.store_hours || ''} onChange={e => set('store_hours', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Owner (Notifikasi Order)</label>
              <input type="text" value={settings.owner_whatsapp || ''} onChange={e => set('owner_whatsapp', e.target.value)} className="input-field" placeholder="Contoh: 6281234567890" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea value={settings.store_address || ''} onChange={e => set('store_address', e.target.value)} rows={2} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo Toko</label>
              <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 w-fit">
                <Upload size={14} /> {logoFile ? logoFile.name : 'Pilih Logo'}
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Informasi Pembayaran</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'bank_bca', label: 'Rekening BCA' },
              { key: 'bank_bri', label: 'Rekening BRI' },
              { key: 'bank_mandiri', label: 'Rekening Mandiri' },
              { key: 'ewallet_gopay', label: 'GoPay' },
              { key: 'ewallet_ovo', label: 'OVO' },
              { key: 'ewallet_dana', label: 'DANA' }
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type="text" value={settings[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
        </div>

        {/* Announcement */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Banner Pengumuman</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teks Pengumuman</label>
              <input type="text" value={settings.announcement_text || ''} onChange={e => set('announcement_text', e.target.value)} className="input-field" placeholder="Teks yang akan ditampilkan di banner" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={settings.announcement_active === 'true'} onChange={e => set('announcement_active', e.target.checked ? 'true' : 'false')} />
                <span className="text-sm text-gray-700">Aktifkan Banner</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kadaluarsa</label>
                <input type="date" value={settings.announcement_expiry || ''} onChange={e => set('announcement_expiry', e.target.value)} className="input-field w-auto" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}
