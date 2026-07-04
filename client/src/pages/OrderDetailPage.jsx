import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package, MapPin, Truck, CreditCard,
  CheckCircle, Clock, XCircle, RefreshCw,
  ShoppingBag, Wrench, Archive, Home, Star
} from 'lucide-react';
import { orderAPI } from '../api';
import {
  formatCurrency, formatDate, formatDateTime,
  getStatusColor, getStatusLabel, getImageUrl
} from '../utils/format';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

// ── Timeline definition ────────────────────────────────────────────────────
const TIMELINE = [
  {
    key: 'pending',
    label: 'Pesanan Dibuat',
    desc: 'Pesanan berhasil dibuat, menunggu pembayaran',
    Icon: ShoppingBag,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-300',
  },
  {
    key: 'paid',
    label: 'Pembayaran Diterima',
    desc: 'Pembayaran telah dikonfirmasi',
    Icon: CreditCard,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    ring: 'ring-blue-300',
  },
  {
    key: 'processing',
    label: 'Diproses',
    desc: 'Pesanan sedang disiapkan oleh penjual',
    Icon: Wrench,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-300',
  },
  {
    key: 'packed',
    label: 'Dikemas',
    desc: 'Pesanan telah dikemas dan siap dikirim',
    Icon: Archive,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    ring: 'ring-cyan-300',
  },
  {
    key: 'shipped',
    label: 'Dikirim',
    desc: 'Pesanan dalam perjalanan ke alamat Anda',
    Icon: Truck,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    ring: 'ring-purple-300',
  },
  {
    key: 'delivered',
    label: 'Terkirim',
    desc: 'Pesanan telah sampai di tujuan',
    Icon: Home,
    color: 'text-green-500',
    bg: 'bg-green-50',
    ring: 'ring-green-300',
  },
  {
    key: 'completed',
    label: 'Selesai',
    desc: 'Transaksi selesai',
    Icon: Star,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-300',
  },
];

const ACTIVE_ORDER_KEYS = TIMELINE.map(t => t.key);

function getTimelineIndex(status) {
  const idx = ACTIVE_ORDER_KEYS.indexOf(status);
  return idx === -1 ? -1 : idx; // -1 = cancelled/refunded
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    orderAPI.getById(id)
      .then(res => setOrder(res.data.data.order))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleCancel = async () => {
    try {
      await orderAPI.cancel(id);
      toast.success('Pesanan berhasil dibatalkan');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membatalkan pesanan');
    }
    setCancelDialog(false);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Pesanan tidak ditemukan</p>
      <Link to="/orders" className="btn-primary mt-4 inline-block">Kembali</Link>
    </div>
  );

  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const activeIdx = getTimelineIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Pesanan</h1>
          <p className="text-gray-500 text-sm mt-0.5">{order.order_number}</p>
          <p className="text-gray-400 text-xs mt-0.5">{formatDateTime(order.created_at)}</p>
        </div>
        <span className={`badge text-sm px-3 py-1.5 font-semibold ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* ── Tracking Timeline ─────────────────────────────────────────── */}
      {!isCancelled ? (
        <div className="card p-6 mb-5">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Truck size={18} className="text-primary" /> Status Pengiriman
          </h3>

          {/* Tracking number banner */}
          {order.shipment?.tracking_number && (
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-6">
              <Package size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Nomor Resi</p>
                <p className="font-bold text-primary tracking-wider">{order.shipment.tracking_number}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500">Kurir</p>
                <p className="text-sm font-medium">{order.courier} {order.service_type}</p>
              </div>
            </div>
          )}

          {/* Estimated delivery */}
          {order.shipment?.estimated_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <Clock size={15} className="text-orange-400" />
              <span>Estimasi tiba: <strong>{formatDate(order.shipment.estimated_date)}</strong></span>
            </div>
          )}

          {/* Timeline steps */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" style={{ zIndex: 0 }} />

            <div className="space-y-0">
              {TIMELINE.map((step, i) => {
                const done = activeIdx >= i;
                const active = activeIdx === i;

                return (
                  <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    {/* Connector fill */}
                    {i < TIMELINE.length - 1 && done && (
                      <div
                        className="absolute left-5 top-10 w-0.5 bg-primary transition-all duration-500"
                        style={{ height: 'calc(100% - 20px)', zIndex: 1 }}
                      />
                    )}

                    {/* Icon circle */}
                    <div
                      className={`
                        relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        ring-2 transition-all duration-300
                        ${done
                          ? `${step.bg} ${step.ring} shadow-sm`
                          : 'bg-gray-100 ring-gray-200'
                        }
                        ${active ? 'scale-110 shadow-md' : ''}
                      `}
                    >
                      {done
                        ? <step.Icon size={18} className={step.color} />
                        : <step.Icon size={18} className="text-gray-300" />
                      }
                    </div>

                    {/* Text */}
                    <div className="pt-1.5 flex-1">
                      <p className={`text-sm font-semibold ${done ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                        {active && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                            Saat ini
                          </span>
                        )}
                      </p>
                      <p className={`text-xs mt-0.5 ${done ? 'text-gray-500' : 'text-gray-300'}`}>
                        {step.desc}
                      </p>
                    </div>

                    {/* Checkmark for completed steps */}
                    {done && !active && (
                      <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Cancelled / Refunded state */
        <div className="card p-5 mb-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <XCircle size={28} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                {order.status === 'refunded' ? 'Pesanan Direfund' : 'Pesanan Dibatalkan'}
              </p>
              <p className="text-sm text-red-500 mt-0.5">
                {order.status === 'refunded'
                  ? 'Dana akan dikembalikan dalam 3–7 hari kerja.'
                  : 'Pesanan ini telah dibatalkan dan tidak dapat diproses lebih lanjut.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Info Cards ────────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Package size={15} /><span className="text-xs font-medium uppercase tracking-wide">Pesanan</span>
          </div>
          <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{order.items?.length} item</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Truck size={15} /><span className="text-xs font-medium uppercase tracking-wide">Kurir</span>
          </div>
          <p className="text-sm font-medium">{order.courier} {order.service_type}</p>
          {order.shipment?.tracking_number
            ? <p className="text-xs text-primary font-mono mt-0.5">{order.shipment.tracking_number}</p>
            : <p className="text-xs text-gray-400 mt-0.5">Belum ada resi</p>
          }
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CreditCard size={15} /><span className="text-xs font-medium uppercase tracking-wide">Pembayaran</span>
          </div>
          <p className="text-sm font-medium capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
          {order.payment && (
            <span className={`badge text-xs mt-1 ${getStatusColor(order.payment.status)}`}>
              {getStatusLabel(order.payment.status)}
            </span>
          )}
        </div>
      </div>

      {/* Address */}
      {order.address && (
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <MapPin size={15} className="text-primary" />
            <span className="font-medium text-sm">Alamat Pengiriman</span>
          </div>
          <p className="text-sm font-medium">{order.address.recipient_name} · {order.address.phone}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.address.full_address}, {order.address.district}, {order.address.city}, {order.address.province} {order.address.postal_code}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="card p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-3">Item Pesanan</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={item.product?.images?.[0] ? getImageUrl(item.product.images[0]) : getImageUrl(null)}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = '/images/daging%20steak.jpg.jpeg'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.quantity}× {formatCurrency(item.product_price)} · {item.weight_gram}g</p>
              </div>
              <span className="font-semibold text-sm flex-shrink-0">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Ongkos Kirim</span><span>{formatCurrency(order.shipping_cost)}</span></div>
          <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t">
            <span>Total</span><span className="text-primary">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="card p-4 mb-4 bg-amber-50 border-amber-200">
          <p className="text-xs font-medium text-amber-700 mb-1">Catatan</p>
          <p className="text-sm text-amber-800">{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {order.status === 'pending' && (
          <>
            <Link to={`/payment/${order.id}`} className="btn-primary flex-1 text-center py-3">
              Bayar Sekarang
            </Link>
            <button
              onClick={() => setCancelDialog(true)}
              className="flex-1 border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
            >
              Batalkan Pesanan
            </button>
          </>
        )}
        {order.status === 'delivered' && (
          <button
            onClick={async () => {
              try {
                await orderAPI.updateStatus(id, { status: 'completed' });
                toast.success('Pesanan ditandai selesai!');
                fetchOrder();
              } catch { toast.error('Gagal mengupdate status'); }
            }}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Pesanan Diterima
          </button>
        )}
        <Link to="/orders" className="btn-outline flex-1 text-center py-3">
          Kembali ke Pesanan
        </Link>
      </div>

      <ConfirmDialog
        open={cancelDialog}
        title="Batalkan Pesanan?"
        message="Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />
    </div>
  );
}
