import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Upload, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { paymentAPI, orderAPI, settingsAPI } from '../api';
import { formatCurrency, formatDateTime } from '../utils/format';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snapLoading, setSnapLoading] = useState(false);
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    Promise.all([
      orderAPI.getById(orderId),
      paymentAPI.getByOrder(orderId),
      settingsAPI.get()
    ]).then(([orderRes, payRes, settingsRes]) => {
      setOrder(orderRes.data.data.order);
      setPayment(payRes.data.data.payment);
      setSettings(settingsRes.data.data.settings);
    }).finally(() => setLoading(false));
  }, [orderId]);

  const handleSnapPay = async () => {
    setSnapLoading(true);
    try {
      let snapToken = payment?.snap_token;

      // Re-request token if not stored
      if (!snapToken) {
        const res = await paymentAPI.createTransaction({ order_id: orderId });
        snapToken = res.data.data.snapToken;
        const updated = await paymentAPI.getByOrder(orderId);
        setPayment(updated.data.data.payment);
      }

      if (!window.snap) {
        toast.error('Midtrans Snap belum dimuat. Coba muat ulang halaman.');
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          toast.success('Pembayaran berhasil!');
          const res = await paymentAPI.getByOrder(orderId);
          setPayment(res.data.data.payment);
        },
        onPending: () => {
          toast('Selesaikan pembayaran Anda.', { icon: '⏳' });
        },
        onError: () => {
          toast.error('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          toast('Popup ditutup.', { icon: 'ℹ️' });
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat pembayaran');
    } finally {
      setSnapLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!proofFile) { toast.error('Pilih file bukti pembayaran'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('proof', proofFile);
      await paymentAPI.uploadProof(payment.id, fd);
      toast.success('Bukti pembayaran berhasil diunggah!');
      const res = await paymentAPI.getByOrder(orderId);
      setPayment(res.data.data.payment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah bukti');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!order) return <div className="text-center py-16"><p>Pesanan tidak ditemukan</p></div>;

  const deadline = order.payment_deadline ? new Date(order.payment_deadline) : null;
  const isExpired = deadline && new Date() > deadline;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          {payment?.status === 'confirmed' ? <CheckCircle size={32} className="text-green-600" /> :
           payment?.status === 'rejected' ? <AlertCircle size={32} className="text-red-600" /> :
           <Clock size={32} className="text-primary" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {payment?.status === 'confirmed' ? 'Pembayaran Dikonfirmasi' :
           payment?.status === 'rejected' ? 'Pembayaran Ditolak' :
           'Selesaikan Pembayaran'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Pesanan #{order.order_number}</p>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600 text-sm">Total Pembayaran</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</span>
        </div>
        {deadline && !isExpired && payment?.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⏰ Batas pembayaran: <strong>{formatDateTime(deadline)}</strong>
          </div>
        )}
        {isExpired && payment?.status === 'pending' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            ❌ Batas waktu pembayaran telah habis
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      {payment?.status === 'pending' && !isExpired && (
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Instruksi Pembayaran</h3>

          {order.payment_method === 'midtrans' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">💳 Pembayaran via Midtrans</p>
                <p className="text-xs text-blue-600">
                  Tersedia: QRIS, GoPay, ShopeePay, Virtual Account, Transfer Bank, Kartu Kredit, dan lainnya.
                </p>
              </div>
              <button
                onClick={handleSnapPay}
                disabled={snapLoading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base font-semibold"
              >
                {snapLoading
                  ? <><Loader2 size={18} className="animate-spin" /> Memuat...</>
                  : '💳 Bayar Sekarang'
                }
              </button>
            </div>
          )}

          {order.payment_method === 'bank_transfer' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Transfer ke salah satu rekening berikut:</p>
              {[
                { bank: 'BCA', account: settings.bank_bca },
                { bank: 'BRI', account: settings.bank_bri },
                { bank: 'Mandiri', account: settings.bank_mandiri }
              ].map(b => (
                <div key={b.bank} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{b.bank}</p>
                    <p className="text-sm text-gray-600">{b.account}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(b.account?.split(' ')[0] || ''); toast.success('Disalin!'); }} className="text-xs text-primary hover:underline">Salin</button>
                </div>
              ))}
            </div>
          )}

          {order.payment_method === 'e-wallet' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Transfer ke salah satu e-wallet berikut:</p>
              {[
                { name: 'GoPay', number: settings.ewallet_gopay, emoji: '💚' },
                { name: 'OVO', number: settings.ewallet_ovo, emoji: '💜' },
                { name: 'DANA', number: settings.ewallet_dana, emoji: '💙' }
              ].map(w => (
                <div key={w.name} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{w.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{w.name}</p>
                      <p className="text-sm text-gray-600">{w.number}</p>
                    </div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(w.number || ''); toast.success('Disalin!'); }} className="text-xs text-primary hover:underline">Salin</button>
                </div>
              ))}
            </div>
          )}

          {order.payment_method === 'credit_card' && (
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
              💳 Pembayaran kartu kredit sedang diproses. Anda akan menerima konfirmasi dalam beberapa menit.
            </div>
          )}

          {/* Upload Proof */}
          {(order.payment_method === 'bank_transfer' || order.payment_method === 'e-wallet') && !payment?.payment_proof_url && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-3">Upload Bukti Pembayaran</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} className="hidden" id="proof-upload" />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">{proofFile ? proofFile.name : 'Klik untuk pilih file'}</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP maks. 5MB</p>
                </label>
              </div>
              <button onClick={handleUpload} disabled={!proofFile || uploading} className="btn-primary w-full mt-3 py-2.5 flex items-center justify-center gap-2">
                <Upload size={16} /> {uploading ? 'Mengunggah...' : 'Upload Bukti Pembayaran'}
              </button>
            </div>
          )}

          {payment?.payment_proof_url && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-green-600 font-medium">✅ Bukti pembayaran sudah diunggah. Menunggu konfirmasi admin.</p>
            </div>
          )}
        </div>
      )}

      {payment?.status === 'confirmed' && (
        <div className="card p-5 mb-4 bg-green-50 border-green-200">
          <p className="text-green-700 text-sm">✅ Pembayaran Anda telah dikonfirmasi. Pesanan sedang diproses.</p>
        </div>
      )}

      {payment?.status === 'rejected' && (
        <div className="card p-5 mb-4 bg-red-50 border-red-200">
          <p className="text-red-700 text-sm font-medium mb-1">❌ Pembayaran Ditolak</p>
          {payment.notes && <p className="text-red-600 text-sm">Alasan: {payment.notes}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <Link to={`/orders/${orderId}`} className="flex-1 btn-outline text-center py-3">Lihat Detail Pesanan</Link>
        <Link to="/orders" className="flex-1 btn-primary text-center py-3">Pesanan Saya</Link>
      </div>
    </div>
  );
}
