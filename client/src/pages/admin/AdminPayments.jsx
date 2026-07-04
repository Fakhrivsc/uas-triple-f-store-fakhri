import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { paymentAPI } from '../../api';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getImageUrl } from '../../utils/format';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [actionDialog, setActionDialog] = useState(null); // { id, action, notes }
  const [notes, setNotes] = useState('');

  const fetchPayments = useCallback(() => {
    setLoading(true);
    paymentAPI.getAll({ page, status, search }).then(res => {
      setPayments(res.data.data.payments);
      setTotalPages(res.data.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleAction = async () => {
    try {
      if (actionDialog.action === 'confirm') await paymentAPI.confirm(actionDialog.id, { notes });
      else if (actionDialog.action === 'reject') await paymentAPI.reject(actionDialog.id, { notes });
      else if (actionDialog.action === 'refund') await paymentAPI.refund(actionDialog.id, { notes });
      toast.success('Pembayaran berhasil diperbarui');
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui pembayaran');
    }
    setActionDialog(null);
    setNotes('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Pembayaran</h2>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nomor pesanan..." className="input-field pl-9 text-sm" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="rejected">Ditolak</option>
            <option value="refunded">Direfund</option>
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
                <th className="p-3 text-left text-gray-600 font-medium">Metode</th>
                <th className="p-3 text-left text-gray-600 font-medium">Jumlah</th>
                <th className="p-3 text-left text-gray-600 font-medium">Bukti</th>
                <th className="p-3 text-left text-gray-600 font-medium">Status</th>
                <th className="p-3 text-left text-gray-600 font-medium">Tanggal</th>
                <th className="p-3 text-left text-gray-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={8} className="p-3"><div className="skeleton h-10 rounded" /></td></tr>
              )) : payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link to={`/admin/orders/${payment.order?.id}`} className="text-primary hover:underline font-medium">{payment.order?.order_number}</Link>
                  </td>
                  <td className="p-3 text-gray-600">{payment.order?.user?.name}</td>
                  <td className="p-3 capitalize text-gray-600">{payment.method?.replace('_', ' ')}</td>
                  <td className="p-3 font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="p-3">
                    {payment.payment_proof_url ? (
                      <a href={getImageUrl(payment.payment_proof_url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">Lihat</a>
                    ) : <span className="text-gray-400 text-xs">-</span>}
                  </td>
                  <td className="p-3"><span className={`badge ${getStatusColor(payment.status)}`}>{getStatusLabel(payment.status)}</span></td>
                  <td className="p-3 text-gray-500">{formatDate(payment.created_at)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {payment.status === 'pending' && (
                        <>
                          <button onClick={() => setActionDialog({ id: payment.id, action: 'confirm' })} className="text-green-600 hover:text-green-700" title="Konfirmasi"><CheckCircle size={16} /></button>
                          <button onClick={() => setActionDialog({ id: payment.id, action: 'reject' })} className="text-red-500 hover:text-red-600" title="Tolak"><XCircle size={16} /></button>
                        </>
                      )}
                      {payment.status === 'confirmed' && (
                        <button onClick={() => setActionDialog({ id: payment.id, action: 'refund' })} className="text-gray-500 hover:text-gray-700" title="Refund"><RefreshCw size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">Tidak ada pembayaran ditemukan</div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActionDialog(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              {actionDialog.action === 'confirm' ? 'Konfirmasi Pembayaran' :
               actionDialog.action === 'reject' ? 'Tolak Pembayaran' : 'Refund Pembayaran'}
            </h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan (opsional)" rows={3} className="input-field mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setActionDialog(null)} className="btn-outline flex-1">Batal</button>
              <button onClick={handleAction} className={`flex-1 px-4 py-2 rounded-lg font-medium text-white ${actionDialog.action === 'confirm' ? 'bg-green-600 hover:bg-green-700' : actionDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {actionDialog.action === 'confirm' ? 'Konfirmasi' : actionDialog.action === 'reject' ? 'Tolak' : 'Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
