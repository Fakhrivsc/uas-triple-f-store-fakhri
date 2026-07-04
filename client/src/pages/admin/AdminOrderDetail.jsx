import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Save, CheckCircle } from 'lucide-react';
import { orderAPI, shipmentAPI } from '../../api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getImageUrl } from '../../utils/format';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  { value: 'pending',    label: 'Menunggu Pembayaran', color: 'text-yellow-600' },
  { value: 'paid',       label: 'Sudah Dibayar',       color: 'text-blue-600' },
  { value: 'processing', label: 'Diproses',             color: 'text-indigo-600' },
  { value: 'packed',     label: 'Dikemas',              color: 'text-cyan-600' },
  { value: 'shipped',    label: 'Dikirim',              color: 'text-purple-600' },
  { value: 'delivered',  label: 'Terkirim',             color: 'text-green-600' },
  { value: 'completed',  label: 'Selesai',              color: 'text-emerald-600' },
  { value: 'cancelled',  label: 'Dibatalkan',           color: 'text-red-600' },
  { value: 'refunded',   label: 'Direfund',             color: 'text-gray-600' },
];

// Visual timeline for admin view
const TIMELINE_STEPS = ['pending', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'completed'];

function AdminTimeline({ status }) {
  const activeIdx = TIMELINE_STEPS.indexOf(status);
  const isCancelled = ['cancelled', 'refunded'].includes(status);

  if (isCancelled) return (
    <div className="flex items-center gap-2 text-red-500 text-sm font-medium py-2">
      <span className="w-3 h-3 rounded-full bg-red-400" />
      {getStatusLabel(status)}
    </div>
  );

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {TIMELINE_STEPS.map((s, i) => {
        const done = activeIdx >= i;
        const active = activeIdx === i;
        return (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex flex-col items-center`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-400'}
                ${active ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}
              `}>
                {done && !active ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1 text-center max-w-[52px] leading-tight
                ${done ? 'text-primary font-medium' : 'text-gray-400'}
              `}>
                {getStatusLabel(s)}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 mb-4 flex-shrink-0 ${i < activeIdx ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [trackingSaving, setTrackingSaving] = useState(false);

  const fetchOrder = () => {
    orderAPI.getById(id).then(res => {
      const o = res.data.data.order;
      setOrder(o);
      setStatusUpdate(o.status);
      setTrackingNumber(o.shipment?.tracking_number || '');
      setEstimatedDate(
        o.shipment?.estimated_date
          ? new Date(o.shipment.estimated_date).toISOString().slice(0, 10)
          : ''
      );
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  // Auto-save status when dropdown changes
  const handleStatusChange = async (newStatus) => {
    setStatusUpdate(newStatus);
    if (newStatus === order.status) return;
    setSaving(true);
    try {
      await orderAPI.updateStatus(id, { status: newStatus });
      toast.success(`Status diubah ke: ${getStatusLabel(newStatus)}`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
      setStatusUpdate(order.status); // revert
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) { toast.error('Masukkan nomor resi'); return; }
    setTrackingSaving(true);
    try {
      await shipmentAPI.update(id, {
        tracking_number: trackingNumber,
        estimated_date: estimatedDate || undefined
      });
      toast.success('Data pengiriman berhasil disimpan');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data pengiriman');
    } finally {
      setTrackingSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  if (!order) return <div className="text-center py-16"><p>Pesanan tidak ditemukan</p></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">Detail Pesanan</h2>
          <p className="text-sm text-gray-500">{order.order_number} · {formatDate(order.created_at)}</p>
        </div>
        <span className={`badge px-3 py-1.5 font-semibold ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Timeline */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Progress Pesanan</p>
        <AdminTimeline status={order.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: items + customer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Item Pesanan</h3>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product?.images?.[0] ? getImageUrl(item.product.images[0]) : getImageUrl(null)}
                    alt={item.product_name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={e => { e.target.src = '/images/daging%20steak.jpg.jpeg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500">{item.quantity}× {formatCurrency(item.product_price)} · {item.weight_gram}g</p>
                  </div>
                  <span className="font-semibold text-sm flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Ongkos Kirim</span><span>{formatCurrency(order.shipping_cost)}</span></div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t">
                <span>Total</span><span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Informasi Pelanggan</h3>
            <p className="text-sm font-medium">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
            {order.address && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Alamat Pengiriman</p>
                <p className="text-sm font-medium">{order.address.recipient_name} · {order.address.phone}</p>
                <p className="text-sm text-gray-500">
                  {order.address.full_address}, {order.address.district}, {order.address.city}, {order.address.province} {order.address.postal_code}
                </p>
              </div>
            )}
            {order.notes && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Catatan</p>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: controls */}
        <div className="space-y-4">
          {/* Status update — auto-saves on change */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>
            <div className="relative">
              <select
                value={statusUpdate}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={saving}
                className="input-field text-sm pr-8 appearance-none"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {saving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Status tersimpan otomatis saat dipilih</p>
          </div>

          {/* Tracking */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Truck size={16} className="text-primary" /> Data Pengiriman
            </h3>
            <p className="text-xs text-gray-500 mb-3">{order.courier} · {order.service_type}</p>

            <label className="block text-xs font-medium text-gray-600 mb-1">Nomor Resi</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="Masukkan nomor resi"
              className="input-field text-sm mb-3"
            />

            <label className="block text-xs font-medium text-gray-600 mb-1">Estimasi Tiba</label>
            <input
              type="date"
              value={estimatedDate}
              onChange={e => setEstimatedDate(e.target.value)}
              className="input-field text-sm mb-3"
            />

            <button
              onClick={handleUpdateTracking}
              disabled={trackingSaving}
              className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2"
            >
              {trackingSaving
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Menyimpan...</>
                : <><Save size={14} /> Simpan Pengiriman</>
              }
            </button>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Pembayaran</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode</span>
                  <span className="capitalize font-medium">{order.payment_method?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className={`badge text-xs ${getStatusColor(order.payment.status)}`}>
                    {getStatusLabel(order.payment.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="font-semibold text-primary">{formatCurrency(order.payment.amount)}</span>
                </div>
              </div>
              {order.payment.payment_proof_url && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-2">Bukti Pembayaran:</p>
                  <a href={getImageUrl(order.payment.payment_proof_url)} target="_blank" rel="noopener noreferrer">
                    <img
                      src={getImageUrl(order.payment.payment_proof_url)}
                      alt="Bukti pembayaran"
                      className="w-full rounded-lg hover:opacity-90 transition-opacity"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </a>
                </div>
              )}
              <Link to="/admin/payments" className="block text-center text-xs text-primary hover:underline mt-3">
                Kelola Pembayaran →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
