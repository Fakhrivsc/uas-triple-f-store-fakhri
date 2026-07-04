import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { userAPI } from '../../api';
import { formatDate, getImageUrl } from '../../utils/format';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [statusDialog, setStatusDialog] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    userAPI.getAllUsers({ page, search, role, is_active: isActive }).then(res => {
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page, search, role, isActive]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async () => {
    try {
      await userAPI.updateUserStatus(statusDialog.id, { is_active: statusDialog.newStatus });
      toast.success(`Akun berhasil ${statusDialog.newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
    setStatusDialog(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Pengguna</h2>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama atau email..." className="input-field pl-9 text-sm" />
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            <option value="">Semua Role</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <select value={isActive} onChange={e => { setIsActive(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-gray-600 font-medium">Pengguna</th>
                <th className="p-3 text-left text-gray-600 font-medium">Telepon</th>
                <th className="p-3 text-left text-gray-600 font-medium">Role</th>
                <th className="p-3 text-left text-gray-600 font-medium">Status</th>
                <th className="p-3 text-left text-gray-600 font-medium">Bergabung</th>
                <th className="p-3 text-left text-gray-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6} className="p-3"><div className="skeleton h-10 rounded" /></td></tr>
              )) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">{user.name?.[0]?.toUpperCase()}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{user.phone || '-'}</td>
                  <td className="p-3">
                    <span className={`badge ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="p-3">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setStatusDialog({ id: user.id, newStatus: !user.is_active, name: user.name })}
                        className={`flex items-center gap-1 text-xs ${user.is_active ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {user.is_active ? <><UserX size={14} /> Nonaktifkan</> : <><UserCheck size={14} /> Aktifkan</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">Tidak ada pengguna ditemukan</div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!statusDialog}
        title={statusDialog?.newStatus ? 'Aktifkan Akun?' : 'Nonaktifkan Akun?'}
        message={`Apakah Anda yakin ingin ${statusDialog?.newStatus ? 'mengaktifkan' : 'menonaktifkan'} akun ${statusDialog?.name}?`}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusDialog(null)}
        variant={statusDialog?.newStatus ? 'warning' : 'danger'}
      />
    </div>
  );
}
