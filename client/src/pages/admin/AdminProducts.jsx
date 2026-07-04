import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, AlertTriangle, ChevronUp, ChevronDown, Package } from 'lucide-react';
import { productAPI, categoryAPI } from '../../api';
import { formatCurrency, getImageUrl } from '../../utils/format';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [selected, setSelected] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    categoryAPI.getAll({ active: 'all' }).then(res => setCategories(res.data.data.categories));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15, sort, order };
    if (search) params.search = search;
    if (category) params.category = category;
    if (isActive !== '') params.is_active = isActive;

    productAPI.getAll(params).then(res => {
      setProducts(res.data.data.products);
      setTotalPages(res.data.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page, search, category, isActive, sort, order]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSort = (field) => {
    if (sort === field) setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(field); setOrder('ASC'); }
  };

  const handleDelete = async () => {
    try {
      await productAPI.delete(deleteId);
      toast.success('Produk berhasil dinonaktifkan');
      fetchProducts();
    } catch { toast.error('Gagal menghapus produk'); }
    setDeleteId(null);
  };

  const handleBulkStatus = async (status) => {
    if (selected.length === 0) { toast.error('Pilih produk terlebih dahulu'); return; }
    try {
      await productAPI.bulkStatus({ ids: selected, is_active: status });
      toast.success(`${selected.length} produk berhasil diperbarui`);
      setSelected([]);
      fetchProducts();
    } catch { toast.error('Gagal memperbarui produk'); }
  };

  const SortIcon = ({ field }) => sort === field ? (order === 'ASC' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Produk</h2>
        <Link to="/admin/products/create" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari produk..." className="input-field pl-9 text-sm" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={isActive} onChange={e => { setIsActive(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bg-primary/10 rounded-lg p-3 mb-4 flex items-center gap-3">
          <span className="text-sm font-medium text-primary">{selected.length} dipilih</span>
          <button onClick={() => handleBulkStatus(true)} className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Aktifkan</button>
          <button onClick={() => handleBulkStatus(false)} className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">Nonaktifkan</button>
          <button onClick={() => setSelected([])} className="text-sm text-gray-500 hover:text-gray-700 ml-auto">Batal</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left w-8">
                  <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={e => setSelected(e.target.checked ? products.map(p => p.id) : [])} />
                </th>
                <th className="p-3 text-left text-gray-600 font-medium">Produk</th>
                <th className="p-3 text-left text-gray-600 font-medium cursor-pointer" onClick={() => handleSort('price')}>
                  <span className="flex items-center gap-1">Harga <SortIcon field="price" /></span>
                </th>
                <th className="p-3 text-left text-gray-600 font-medium cursor-pointer" onClick={() => handleSort('stock')}>
                  <span className="flex items-center gap-1">Stok <SortIcon field="stock" /></span>
                </th>
                <th className="p-3 text-left text-gray-600 font-medium">Kategori</th>
                <th className="p-3 text-left text-gray-600 font-medium">Status</th>
                <th className="p-3 text-left text-gray-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="p-3"><div className="skeleton h-10 rounded" /></td></tr>
              )) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={e => setSelected(e.target.checked ? [...selected, p.id] : selected.filter(id => id !== p.id))} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] ? getImageUrl(p.images[0]) : 'https://placehold.co/40x40/1B4332/white?text=🥩'} alt="" className="w-10 h-10 rounded-lg object-cover" onError={e => { e.target.src = 'https://placehold.co/40x40/1B4332/white?text=🥩'; }} />
                      <div>
                        <p className="font-medium text-gray-800 max-w-[200px] truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.weight_gram}g</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{formatCurrency(p.discount_price || p.price)}</p>
                    {p.discount_price && <p className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</p>}
                  </td>
                  <td className="p-3">
                    <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-orange-600' : 'text-gray-800'}`}>
                      {p.stock}
                      {p.stock < 10 && p.stock > 0 && <AlertTriangle size={12} className="inline ml-1 text-orange-500" />}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{p.category?.name}</td>
                  <td className="p-3">
                    <span className={`badge ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="text-gray-400 hover:text-primary"><Edit2 size={16} /></Link>
                      <button onClick={() => setDeleteId(p.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Package size={40} className="mx-auto mb-2 text-gray-300" />
            <p>Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        title="Nonaktifkan Produk?"
        message="Produk akan dinonaktifkan dan tidak tampil di toko. Anda bisa mengaktifkannya kembali kapan saja."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
