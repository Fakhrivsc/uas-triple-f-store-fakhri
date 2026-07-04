import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderAPI } from '../api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../utils/format';
import Pagination from '../components/ui/Pagination';

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'packed', label: 'Dikemas' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Terkirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

// Mini progress dots shown on each order card
const PROGRESS_STEPS = ['pending', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'completed'];

function MiniProgress({ status }) {
  if (['cancelled', 'refunded'].includes(status)) {
    return (
      <span className="text-xs text-red-500 font-medium flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
        {getStatusLabel(status)}
      </span>
    );
  }
  const activeIdx = PROGRESS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {PROGRESS_STEPS.map((s, i) => (
        <div
          key={s}
          title={getStatusLabel(s)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < activeIdx
              ? 'bg-primary w-4'
              : i === activeIdx
              ? 'bg-primary w-5 shadow-sm shadow-primary/40'
              : 'bg-gray-200 w-3'
          }`}
        />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    orderAPI.getMine({ page, status, search })
      .then(res => {
        setOrders(res.data.data.orders);
        setTotalPages(res.data.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, status, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan Saya</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              status === f.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari nomor pesanan..."
          className="input-field max-w-xs text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Pesanan</h3>
          <p className="text-gray-500 text-sm mb-4">Mulai belanja dan pesanan Anda akan muncul di sini</p>
          <Link to="/products" className="btn-primary">Mulai Belanja</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="card p-4 block hover:shadow-md transition-all duration-200 hover:border-primary/30 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm text-gray-800 group-hover:text-primary transition-colors">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Mini progress */}
                <div className="mb-3">
                  <MiniProgress status={order.status} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package size={13} />
                    <span className="text-xs">{order.items?.length} item</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs">{order.courier} {order.service_type}</span>
                    {order.shipment?.tracking_number && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs font-mono text-primary">{order.shipment.tracking_number}</span>
                      </>
                    )}
                  </div>
                  <p className="font-bold text-primary text-sm">{formatCurrency(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
