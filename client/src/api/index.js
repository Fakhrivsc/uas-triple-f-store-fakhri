import api from './axios';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh')
};

// Users
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  updateAvatar: (formData) => api.put('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/users/me/password', data),
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/users/${id}/status`, data)
};

// Addresses
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`)
};

// Categories
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (formData) => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id, hard = false) => api.delete(`/products/${id}`, { params: { hard } }),
  bulkStatus: (data) => api.put('/products/bulk/status', data)
};

// Wishlist
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`)
};

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  merge: (data) => api.post('/cart/merge', data)
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMine: (params) => api.get('/orders/mine', { params }),
  getAll: (params) => api.get('/orders/admin', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data)
};

// Payments
export const paymentAPI = {
  getByOrder: (orderId) => api.get(`/payments/${orderId}`),
  getAll: (params) => api.get('/payments/admin', { params }),
  createTransaction: (data) => api.post('/payments/create-transaction', data),
  uploadProof: (id, formData) => api.put(`/payments/${id}/upload-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  confirm: (id, data) => api.put(`/payments/${id}/confirm`, data),
  reject: (id, data) => api.put(`/payments/${id}/reject`, data),
  refund: (id, data) => api.put(`/payments/${id}/refund`, data)
};

// Shipments
export const shipmentAPI = {
  getOptions: () => api.get('/shipments/options'),
  getByOrder: (orderId) => api.get(`/shipments/${orderId}`),
  update: (orderId, data) => api.put(`/shipments/${orderId}`, data),
  updateStatus: (id, data) => api.put(`/shipments/${id}/status`, data)
};

// RajaOngkir Shipping
export const shippingAPI = {
  getProvinces: () => api.get('/shipping/provinces'),
  getCities: (provinceId) => api.get(`/shipping/cities/${provinceId}`),
  getCost: (data) => api.post('/shipping/cost', data)
};

// Reviews
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  checkEligibility: (productId) => api.get(`/reviews/eligibility/${productId}`),
  getAll: (params) => api.get('/reviews/admin', { params }),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`)
};

// Dashboard
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getChart: (params) => api.get('/dashboard/chart', { params }),
  getTopProducts: () => api.get('/dashboard/top-products')
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (formData) => api.put('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};
