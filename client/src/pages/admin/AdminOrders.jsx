import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { orderAPI } from '../../api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';

const STATUSES = ['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderAPI.getAll({ page, status, search }).then(res => {
      setOrders(res.data.data.orders);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    }).finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Pesanan ({total})</h2>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nomor pesanan..." className="input-field pl-9 text-sm" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            {STATUSES.map(s => <option key={s} value={s}>{s ? getStatusLabel(s) : 'Semua Status'}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-gray-600 font-medium">No. Pesanan</th>
                <th className="p-3 text-left text-gray-600 font-medium">Pelanggan</th>
                <th className="p-3 text-left text-gray-600 font-medium">Total</th>
                <th className="p-3 text-left text-gray-600 font-medium">Kurir</th>
                <th className="p-3 text-left text-gray-600 font-medium">Status</th>
                <th className="p-3 text-left text-gray-600 font-medium">Tanggal</th>
                <th className="p-3 text-left text-gray-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="p-3"><div className="skeleton h-10 rounded" /></td></tr>
              )) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-primary">{order.order_number}</td>
                  <td className="p-3 text-gray-600">{order.user?.name}</td>
                  <td className="p-3 font-medium">{formatCurrency(order.total)}</td>
                  <td className="p-3 text-gray-600">{order.courier} {order.service_type}</td>
                  <td className="p-3"><span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                  <td className="p-3 text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="p-3">
                    <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline text-xs font-medium">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">Tidak ada pesanan ditemukan</div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
