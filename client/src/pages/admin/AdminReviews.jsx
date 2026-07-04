import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { reviewAPI } from '../../api';
import { formatDate } from '../../utils/format';
import StarRating from '../../components/ui/StarRating';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    reviewAPI.getAll({ page }).then(res => {
      setReviews(res.data.data.reviews);
      setTotalPages(res.data.data.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [page]);

  const handleDelete = async () => {
    try {
      await reviewAPI.delete(deleteId);
      toast.success('Ulasan berhasil dihapus');
      fetchReviews();
    } catch { toast.error('Gagal menghapus ulasan'); }
    setDeleteId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Moderasi Ulasan</h2>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-gray-600 font-medium">Pengguna</th>
                <th className="p-3 text-left text-gray-600 font-medium">Produk</th>
                <th className="p-3 text-left text-gray-600 font-medium">Rating</th>
                <th className="p-3 text-left text-gray-600 font-medium">Komentar</th>
                <th className="p-3 text-left text-gray-600 font-medium">Tanggal</th>
                <th className="p-3 text-left text-gray-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6} className="p-3"><div className="skeleton h-10 rounded" /></td></tr>
              )) : reviews.map(review => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{review.user?.name}</td>
                  <td className="p-3 text-gray-600 max-w-[150px] truncate">{review.product?.name}</td>
                  <td className="p-3"><StarRating rating={review.rating} size={14} /></td>
                  <td className="p-3 text-gray-600 max-w-[200px]">
                    <p className="line-clamp-2">{review.comment || '-'}</p>
                  </td>
                  <td className="p-3 text-gray-500">{formatDate(review.created_at)}</td>
                  <td className="p-3">
                    <button onClick={() => setDeleteId(review.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reviews.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">Tidak ada ulasan</div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        title="Hapus Ulasan?"
        message="Ulasan ini akan dihapus permanen."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
