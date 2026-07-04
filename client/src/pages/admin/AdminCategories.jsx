import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { categoryAPI } from '../../api';
import { getImageUrl } from '../../utils/format';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    categoryAPI.getAll({ active: 'all' }).then(res => setCategories(res.data.data.categories)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('is_active', form.is_active);
      if (imageFile) fd.append('image', imageFile);

      if (editId) {
        await categoryAPI.update(editId, fd);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await categoryAPI.create(fd);
        toast.success('Kategori berhasil dibuat');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      setImageFile(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', is_active: cat.is_active });
    setEditId(cat.id);
    setShowForm(true);
    setImageFile(null);
  };

  const handleDelete = async () => {
    try {
      await categoryAPI.delete(deleteId);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori');
    }
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Kategori</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); setImageFile(null); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                  <Upload size={14} /> {imageFile ? imageFile.name : 'Pilih Gambar'}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" />
                </label>
                {imageFile && <button type="button" onClick={() => setImageFile(null)} className="text-red-500"><X size={16} /></button>}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-outline flex-1">Batal</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />) :
          categories.map(cat => (
            <div key={cat.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {cat.image_url ? (
                    <img src={getImageUrl(cat.image_url)} alt="" className="w-12 h-12 rounded-lg object-cover" onError={e => { e.target.src = 'https://placehold.co/48x48/1B4332/white?text=🥩'; }} />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">🥩</div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.product_count} produk</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-primary"><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteId(cat.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500 line-clamp-1">{cat.description || 'Tidak ada deskripsi'}</p>
                <span className={`badge text-xs ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {cat.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          ))
        }
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Hapus Kategori?"
        message="Kategori yang memiliki produk tidak dapat dihapus."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
