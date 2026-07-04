import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/format';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getSummary(),
      dashboardAPI.getChart({ days: 7 }),
      dashboardAPI.getTopProducts()
    ]).then(([s, c, t]) => {
      setSummary(s.data.data);
      setChart(c.data.data.chart);
      setTopProducts(t.data.data.top_products);
    }).catch((err) => {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || 'Gagal memuat data dashboard');
    }).finally(() => setLoading(false));
  }, []);

  const cards = summary ? [
    { title: 'Pendapatan Bulan Ini', value: formatCurrency(summary.revenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Pesanan', value: summary.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', sub: `${summary.monthOrders} bulan ini` },
    { title: 'Total Pelanggan', value: summary.totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Produk Aktif', value: summary.totalProducts, icon: Package, color: 'text-primary', bg: 'bg-primary/10' }
  ] : [];

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertTriangle size={48} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Coba Lagi</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{card.title}</p>
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            {card.sub && <p className="text-xs text-gray-500 mt-1">{card.sub}</p>}
          </div>
        ))}
      </div>

      {summary?.pendingPayments > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            Ada <strong>{summary.pendingPayments}</strong> pembayaran menunggu konfirmasi.{' '}
            <Link to="/admin/payments" className="underline font-medium">Konfirmasi sekarang</Link>
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Pendapatan 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={l => `Tanggal: ${l}`} />
              <Bar dataKey="revenue" fill="#1B4332" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada data</p>
            ) : topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.product_name}</p>
                  <p className="text-xs text-gray-500">{p.total_sold} terjual</p>
                </div>
                <span className="text-sm font-semibold text-primary">{formatCurrency(p.total_revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Pesanan Terbaru</h3>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">No. Pesanan</th>
                <th className="pb-2 font-medium">Pelanggan</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary?.recentOrders?.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-2">
                    <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">{order.order_number}</Link>
                  </td>
                  <td className="py-2 text-gray-600">{order.user?.name}</td>
                  <td className="py-2 font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-2"><span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                  <td className="py-2 text-gray-500">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock */}
      {summary?.lowStockProducts?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-800">Stok Menipis</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {summary.lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                <span className="text-sm font-medium truncate">{p.name}</span>
                <span className={`text-sm font-bold ml-2 ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {p.stock === 0 ? 'Habis' : `${p.stock} sisa`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
