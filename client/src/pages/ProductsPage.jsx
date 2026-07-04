import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productAPI, categoryAPI } from '../api';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import Pagination from '../components/ui/Pagination';
import { formatCurrency } from '../utils/format';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'DESC';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const [priceRange, setPriceRange] = useState([minPrice || 0, maxPrice || 1000000]);

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data.categories)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12, sort, order };
    if (search) params.search = search;
    if (category) params.category = category;
    if (priceRange[0] > 0) params.min_price = priceRange[0];
    if (priceRange[1] < 1000000) params.max_price = priceRange[1];

    productAPI.getAll(params).then(res => {
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page, search, category, sort, order, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value; else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  const sortOptions = [
    { value: 'created_at-DESC', label: 'Terbaru' },
    { value: 'price-ASC', label: 'Harga Terendah' },
    { value: 'price-DESC', label: 'Harga Tertinggi' },
    { value: 'name-ASC', label: 'A-Z' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Semua Produk</h1>
          <p className="text-sm text-gray-500 mt-1">{total} produk ditemukan</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={`${sort}-${order}`}
            onChange={e => { const [s, o] = e.target.value.split('-'); updateParam('sort', s); updateParam('order', o); }}
            className="input-field w-auto text-sm"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFilterOpen(!filterOpen)} className="md:hidden btn-outline flex items-center gap-2 text-sm">
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filter */}
        <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
          <div className="card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Filter</h3>
              <button onClick={() => setFilterOpen(false)} className="md:hidden text-gray-400"><X size={18} /></button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Cari Produk</label>
              <input
                type="text" value={search}
                onChange={e => updateParam('search', e.target.value)}
                placeholder="Nama produk..."
                className="input-field text-sm"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="category" checked={!category} onChange={() => updateParam('category', '')} />
                  <span>Semua Kategori</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="category" checked={category === String(cat.id)} onChange={() => updateParam('category', cat.id)} />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rentang Harga</label>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Min"
                  value={priceRange[0]}
                  onChange={e => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="input-field text-sm w-1/2"
                />
                <input
                  type="number" placeholder="Max"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                  className="input-field text-sm w-1/2"
                />
              </div>
              <button onClick={() => { updateParam('min_price', priceRange[0]); updateParam('max_price', priceRange[1]); }} className="btn-primary w-full mt-2 text-sm py-1.5">
                Terapkan
              </button>
            </div>

            {(search || category || minPrice || maxPrice) && (
              <button
                onClick={() => { setSearchParams({}); setPriceRange([0, 1000000]); }}
                className="text-sm text-red-500 hover:underline w-full text-center"
              >
                Reset Filter
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian Anda</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={p => updateParam('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
