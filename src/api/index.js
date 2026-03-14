import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  validate: ()     => api.get('/auth/validate'),
};

// ── Admin: user creation ──────────────────────────────────────────────────────
export const adminUserAPI = {
  createStudent: (data) => api.post('/admin/users/student', data),
  createWarden:  (data) => api.post('/admin/users/warden', data),
};

// ── Wardens ───────────────────────────────────────────────────────────────────
export const wardenAPI = {
  getAll:        ()         => api.get('/wardens'),
  getMe:         ()         => api.get('/wardens/me'),
  getById:       (id)       => api.get(`/wardens/${id}`),
  updateMe:      (data)     => api.put('/wardens/me', data),
  update:        (id, data) => api.put(`/wardens/${id}`, data),
  delete:        (id)       => api.delete(`/wardens/${id}`),
};

// ── Students ──────────────────────────────────────────────────────────────────
export const studentAPI = {
  getAll:       ()       => api.get('/students'),
  getById:      (id)     => api.get(`/students/${id}`),
  getMe:        ()       => api.get('/students/me'),
  getByUserId:  (uid)    => api.get(`/students/user/${uid}`),
  search:       (name)   => api.get('/students/search', { params: { name } }),
  getByStatus:  (status) => api.get(`/students/status/${status}`),
  update:       (id, data) => api.put(`/students/${id}`, data),
  assignRoom:   (sid, rid) => api.put(`/students/${sid}/assign-room/${rid}`),
  vacateRoom:   (sid)    => api.put(`/students/${sid}/vacate-room`),
  delete:       (id)     => api.delete(`/students/${id}`),
  getStats:     ()       => api.get('/students/stats'),
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
export const roomAPI = {
  getAll:       ()       => api.get('/rooms'),
  getById:      (id)     => api.get(`/rooms/${id}`),
  getAvailable: ()       => api.get('/rooms/available'),
  getByBlock:   (block)  => api.get(`/rooms/block/${block}`),
  getByType:    (type)   => api.get(`/rooms/type/${type}`),
  getByStatus:  (status) => api.get(`/rooms/status/${status}`),
  create:       (data)   => api.post('/rooms', data),
  update:       (id, data) => api.put(`/rooms/${id}`, data),
  updateStatus: (id, status) => api.put(`/rooms/${id}/status`, null, { params: { status } }),
  delete:       (id)     => api.delete(`/rooms/${id}`),
  getStats:     ()       => api.get('/rooms/stats'),
};

// ── Complaints ────────────────────────────────────────────────────────────────
export const complaintAPI = {
  getAll:        ()           => api.get('/complaints'),
  getById:       (id)         => api.get(`/complaints/${id}`),
  getMy:         ()           => api.get('/complaints/my'),
  getByStudent:  (sid)        => api.get(`/complaints/student/${sid}`),
  getByStatus:   (status)     => api.get(`/complaints/status/${status}`),
  getByCategory: (cat)        => api.get(`/complaints/category/${cat}`),
  create:        (data)       => api.post('/complaints', data),
  update:        (id, data)   => api.put(`/complaints/${id}`, data),
  updateStatus:  (id, status, remarks) =>
    api.put(`/complaints/${id}/status`, null, { params: { status, remarks } }),
  delete:        (id)         => api.delete(`/complaints/${id}`),
  getPendingCount: ()         => api.get('/complaints/stats/pending'),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  getAll:          ()         => api.get('/payments'),
  getById:         (id)       => api.get(`/payments/${id}`),
  getMy:           ()         => api.get('/payments/my'),
  getByStudent:    (sid)      => api.get(`/payments/student/${sid}`),
  getByStatus:     (status)   => api.get(`/payments/status/${status}`),
  create:          (sid, data) => api.post(`/payments/student/${sid}`, data),
  markPaid:        (id, method) =>
    api.put(`/payments/${id}/pay`, null, { params: { method } }),
  updateStatus:    (id, status) =>
    api.put(`/payments/${id}/status`, null, { params: { status } }),
  generateMonthly: (month)    => api.post('/payments/generate-monthly', null, { params: { month } }),
  delete:          (id)       => api.delete(`/payments/${id}`),
  getStats:        ()         => api.get('/payments/stats'),
};

// ── Mess ──────────────────────────────────────────────────────────────────────
export const messAPI = {
  getAll:     ()     => api.get('/mess/menu'),
  getWeekly:  ()     => api.get('/mess/menu/weekly'),
  getToday:   ()     => api.get('/mess/menu/today'),
  getByDay:   (day)  => api.get(`/mess/menu/day/${day}`),
  getByMeal:  (meal) => api.get(`/mess/menu/meal/${meal}`),
  getById:    (id)   => api.get(`/mess/menu/${id}`),
  create:     (data) => api.post('/mess/menu', data),
  update:     (id, data) => api.put(`/mess/menu/${id}`, data),
  delete:     (id)   => api.delete(`/mess/menu/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getMy:         ()     => api.get('/notifications'),
  getUnread:     ()     => api.get('/notifications/unread'),
  getUnreadCount:()     => api.get('/notifications/unread/count'),
  getAll:        ()     => api.get('/notifications/all'),
  sendToUser:    (uid, title, message, type) =>
    api.post(`/notifications/send/${uid}`, null, { params: { title, message, type } }),
  sendGlobal:    (title, message, type) =>
    api.post('/notifications/global', null, { params: { title, message, type } }),
  markRead:      (id)   => api.put(`/notifications/${id}/read`),
  markAllRead:   ()     => api.put('/notifications/read-all'),
  delete:        (id)   => api.delete(`/notifications/${id}`),
};
