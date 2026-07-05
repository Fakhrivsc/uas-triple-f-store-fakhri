export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
};

export const getImageUrl = (url) => {
  const base = import.meta.env.BASE_URL || '/';
  const basePath = base.replace(/\/$/, '');

  if (!url) return `${basePath}/images/daging%20steak.jpg.jpeg`; // sensible default from public folder
  if (url.startsWith('http')) return url;
  
  // Local public folder images (e.g. /images/...) — encode spaces for browser fetch
  if (url.startsWith('/images/')) {
    const encodedUrl = url.split('/').map((seg, i) => i === 0 ? seg : encodeURIComponent(seg)).join('/');
    return `${basePath}${encodedUrl}`;
  }
  
  // Uploaded files served from the API server (e.g. /uploads/...)
  return `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${url}`;
};

export const getStatusColor = (status) => {
  const colors = {
    // Order statuses
    pending:    'bg-yellow-100 text-yellow-800',
    paid:       'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    packed:     'bg-cyan-100 text-cyan-800',
    shipped:    'bg-purple-100 text-purple-800',
    delivered:  'bg-green-100 text-green-800',
    completed:  'bg-emerald-100 text-emerald-800',
    cancelled:  'bg-red-100 text-red-800',
    refunded:   'bg-gray-100 text-gray-800',
    // Payment statuses
    confirmed:  'bg-green-100 text-green-800',
    rejected:   'bg-red-100 text-red-800',
    expired:    'bg-gray-100 text-gray-500',
    // Shipment statuses
    waiting:    'bg-yellow-100 text-yellow-800',
    picked_up:  'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    // Order
    pending:    'Menunggu Pembayaran',
    paid:       'Sudah Dibayar',
    processing: 'Diproses',
    packed:     'Dikemas',
    shipped:    'Dikirim',
    delivered:  'Terkirim',
    completed:  'Selesai',
    cancelled:  'Dibatalkan',
    refunded:   'Direfund',
    // Payment
    confirmed:  'Dikonfirmasi',
    rejected:   'Ditolak',
    expired:    'Kedaluwarsa',
    // Shipment
    waiting:    'Menunggu',
    picked_up:  'Dijemput',
    in_transit: 'Dalam Perjalanan',
  };
  return labels[status] || status;
};

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + '...' : str;
