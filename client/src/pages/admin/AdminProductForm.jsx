import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { productAPI, categoryAPI } from '../../api';
import { getImageUrl } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', category_id: '', description: '', price: '', discount_price: '',
    stock: '', weight_gram: '', unit: 'gram', is_active: true
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    categoryAPI.getAll({ active: 'all' }).then(res => setCategories(res.data.data.categories));
    if (isEdit) {
      // Fetch all products and find by id
      const token = localStorage.getItem('accessToken');
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/products?page=1&limit=200&is_active=`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).then(r => r.json()).then(data => {
        const p = data.data?.products?.find(p => p.id === parseInt(id));
        if (p) {
          setForm({
            name: p.name, category_id: p.category_id, description: p.description || '',
            price: p.price, discount_price: p.discount_price || '', stock: p.stock,
            weight_gram: p.weight_gram, unit: p.unit, is_active: p.is_active
          });
          setExistingImages(p.images || []);
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length - removedImages.length + images.length + files.length;
    if (total > 5) { toast.error('Maksimal 5 gambar'); return; }
    setImages([...images, ...files]);
  };

  const handleRemoveNew = (i) => setImages(images.filter((_, idx) => idx !== i));
  const handleRemoveExisting = (url) => setRemovedImages([...removedImages, url]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      if (removedImages.length > 0) removedImages.forEach(url => fd.append('remove_images', url));

      if (isEdit) {
        await productAPI.update(id, fd);
        toast.success('Produk berhasil diperbarui');
      } else {
        await productAPI.create(fd);
        toast.success('Produk berhasil dibuat');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const activeExisting = existingImages.filter(url => !removedImages.includes(url));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Informasi Produk</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field" required>
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Harga & Stok</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Normal (Rp) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Diskon (Rp)</label>
                <input type="number" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat (gram) *</label>
                <input type="number" value={form.weight_gram} onChange={e => setForm({ ...form, weight_gram: e.target.value })} className="input-field" min="1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field">
                  <option value="gram">Gram</option>
                  <option value="kg">Kilogram</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-4">Gambar Produk</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {activeExisting.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://placehold.co/80x80/1B4332/white?text=🥩'; }} />
                  <button type="button" onClick={() => handleRemoveExisting(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                </div>
              ))}
              {images.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveNew(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                </div>
              ))}
              {(activeExisting.length + images.length) < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Tambah</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">Maks. 5 gambar, JPG/PNG/WEBP, maks. 5MB</p>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Status</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-300'}`} onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{form.is_active ? 'Aktif' : 'Nonaktif'}</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline flex-1">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
