import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Star, Loader2 } from 'lucide-react';
import { addressAPI, shippingAPI } from '../api';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  label: '', recipient_name: '', phone: '',
  province_id: '', province: '',
  city_id: '', city: '',
  district: '', postal_code: '', full_address: '', is_default: false
};

export default function AddressesPage() {
  const [addresses, setAddresses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState(null);
  const [saving, setSaving]         = useState(false);

  // Province / city dropdown state
  const [provinces, setProvinces]   = useState([]);
  const [cities, setCities]         = useState([]);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  const fetchAddresses = () => {
    addressAPI.getAll()
      .then(res => setAddresses(res.data.data.addresses))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  // Load provinces when form opens
  useEffect(() => {
    if (!showForm || provinces.length > 0) return;
    setLoadingProv(true);
    shippingAPI.getProvinces()
      .then(res => setProvinces(res.data.data.provinces || []))
      .catch(() => toast.error('Gagal memuat daftar provinsi'))
      .finally(() => setLoadingProv(false));
  }, [showForm]);

  // Load cities when province changes
  useEffect(() => {
    if (!form.province_id) { setCities([]); return; }
    setLoadingCity(true);
    setCities([]);
    shippingAPI.getCities(form.province_id)
      .then(res => setCities(res.data.data.cities || []))
      .catch(() => toast.error('Gagal memuat daftar kota'))
      .finally(() => setLoadingCity(false));
  }, [form.province_id]);

  const handleProvinceChange = (e) => {
    const id   = e.target.value;
    const name = provinces.find(p => p.province_id === id)?.province || '';
    setForm(f => ({ ...f, province_id: id, province: name, city_id: '', city: '' }));
  };

  const handleCityChange = (e) => {
    const id   = e.target.value;
    const obj  = cities.find(c => c.city_id === id);
    const name = obj ? `${obj.type} ${obj.city_name}` : '';
    const postal = obj?.postal_code || form.postal_code;
    setForm(f => ({ ...f, city_id: id, city: name, postal_code: postal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.province_id && !form.province) {
      toast.error('Pilih provinsi terlebih dahulu'); return;
    }
    setSaving(true);
    try {
      if (editId) {
        await addressAPI.update(editId, form);
        toast.success('Alamat berhasil diperbarui');
      } else {
        await addressAPI.create(form);
        toast.success('Alamat berhasil ditambahkan');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label, recipient_name: addr.recipient_name, phone: addr.phone,
      province_id: addr.province_id || '', province: addr.province,
      city_id: addr.city_id || '', city: addr.city,
      district: addr.district, postal_code: addr.postal_code,
      full_address: addr.full_address, is_default: addr.is_default
    });
    setEditId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await addressAPI.delete(deleteId);
      toast.success('Alamat berhasil dihapus');
      fetchAddresses();
    } catch { toast.error('Gagal menghapus alamat'); }
    setDeleteId(null);
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefault(id);
      toast.success('Alamat utama berhasil diubah');
      fetchAddresses();
    } catch { toast.error('Gagal mengubah alamat utama'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Alamat Pengiriman</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Tambah Alamat
        </button>
      </div>

      {/* ── Address Form ── */}
      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editId ? 'Edit Alamat' : 'Tambah Alamat Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label (Rumah/Kantor)</label>
              <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="input-field" required />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
              <input type="text" value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} className="input-field" required />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" required />
            </div>

            {/* Province dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provinsi {loadingProv && <Loader2 size={12} className="inline animate-spin ml-1" />}
              </label>
              <select
                value={form.province_id}
                onChange={handleProvinceChange}
                className="input-field"
                required
                disabled={loadingProv}
              >
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map(p => (
                  <option key={p.province_id} value={p.province_id}>{p.province}</option>
                ))}
              </select>
            </div>

            {/* City dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kota/Kabupaten {loadingCity && <Loader2 size={12} className="inline animate-spin ml-1" />}
              </label>
              <select
                value={form.city_id}
                onChange={handleCityChange}
                className="input-field"
                required
                disabled={!form.province_id || loadingCity}
              >
                <option value="">-- Pilih Kota --</option>
                {cities.map(c => (
                  <option key={c.city_id} value={c.city_id}>
                    {c.type} {c.city_name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
              <input type="text" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="input-field" required />
            </div>

            {/* Postal code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
              <input type="text" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className="input-field" required />
            </div>

            {/* Full address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea value={form.full_address} onChange={e => setForm({ ...form, full_address: e.target.value })} rows={3} className="input-field" required />
            </div>

            {/* Default checkbox */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} className="accent-primary" />
                <span className="text-sm text-gray-700">Jadikan alamat utama</span>
              </label>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline flex-1">Batal</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Address List ── */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Belum ada alamat tersimpan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className={`card p-4 transition-colors ${addr.is_default ? 'border-primary/30 bg-primary/5' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{addr.label}</span>
                    {addr.is_default && <span className="badge bg-primary/10 text-primary text-xs">Utama</span>}
                  </div>
                  <p className="text-sm text-gray-700">{addr.recipient_name} · {addr.phone}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {addr.full_address}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                  </p>
                  {addr.city_id && (
                    <p className="text-xs text-gray-400 mt-0.5">City ID: {addr.city_id}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Star size={12} /> Utamakan
                    </button>
                  )}
                  <button onClick={() => handleEdit(addr)} className="text-gray-400 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Hapus Alamat?"
        message="Apakah Anda yakin ingin menghapus alamat ini?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
