import axios from 'axios';

/**
 * API Service - Konfigurasi Axios Instance
 * 
 * File ini mengatur base URL, interceptors, dan export API endpoints
 * untuk digunakan di seluruh aplikasi
 */

// Membuat instance axios dengan konfigurasi default
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 detik timeout
});

/**
 * Interceptor untuk menambahkan token ke setiap request
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor untuk handle response errors
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika token expired (dan bukan request login/register), redirect ke login
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/login') || requestUrl.includes('/register');
    
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API Endpoints
 */
export const authAPI = {
  login: (email, password) => {
    return API.post('/login', { email, password });
  },
  signup: (userData) => {
    return API.post('/register', userData);
  },
  logout: () => {
    return API.post('/logout');
  },
  getCurrentUser: () => {
    return API.get('/me');
  },
  changePassword: (data) => {
    return API.post('/change-password', data);
  },
  updateLpkProfile: (data) => {
    return API.put('/lpk/profile', data);
  },
};

/**
 * Pelatihan API Endpoints (untuk Admin/semua role)
 */
export const pelatihanAPI = {
  getAll: (paginate = 'true', search = '', status = '', page = 1) => {
    const params = new URLSearchParams({ paginate, page });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return API.get(`/lpk/pelatihan?${params.toString()}`);
  },
  getById: (id) => API.get(`/lpk/pelatihan/${id}`),
  create: (data) => API.post('/lpk/pelatihan', data),
  update: (id, data) => API.put(`/lpk/pelatihan/${id}`, data),
  delete: (id) => API.delete(`/lpk/pelatihan/${id}`),
};

/**
 * LPK Portal API Endpoints
 * Khusus untuk role LPK — semua request di-scope ke data milik LPK yang login.
 * Base prefix: /lpk-portal/
 */
export const lpkPortalAPI = {
  // ── Pelatihan ──────────────────────────────────────────
  pelatihan: {
    getAll:  ()         => API.get('/lpk-portal/pelatihan'),
    getById: (id)       => API.get(`/lpk-portal/pelatihan/${id}`),
    create:  (data)     => API.post('/lpk-portal/pelatihan', data),
    update:  (id, data) => API.put(`/lpk-portal/pelatihan/${id}`, data),
    delete:  (id)       => API.delete(`/lpk-portal/pelatihan/${id}`),
  },

  // ── Peserta Pelatihan ───────────────────────────────────
  pesertaPelatihan: {
    getAll:   (params = '') => API.get(`/lpk-portal/peserta-pelatihan?${params}`),
    getById:  (id)          => API.get(`/lpk-portal/peserta-pelatihan/${id}`),
    create:   (formData)    => API.post('/lpk-portal/peserta-pelatihan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update:   (id, formData) => API.post(`/lpk-portal/peserta-pelatihan/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete:          (id)   => API.delete(`/lpk-portal/peserta-pelatihan/${id}`),
    importPreview:   (data) => API.post('/lpk-portal/peserta-pelatihan/import-preview', data),
    importCommit:    (data) => API.post('/lpk-portal/peserta-pelatihan/import-commit', data),
    getImportHistory: (params = '') => API.get(`/lpk-portal/peserta-pelatihan/import-history?${params}`),
  },

  // ── Sertifikasi ─────────────────────────────────────────
  sertifikasi: {
    getAll:   (params = '') => API.get(`/lpk-portal/sertifikasi?${params}`),
    getById:  (id)          => API.get(`/lpk-portal/sertifikasi/${id}`),
    create:   (formData)    => API.post('/lpk-portal/sertifikasi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update:   (id, formData) => API.post(`/lpk-portal/sertifikasi/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete:   (id)          => API.delete(`/lpk-portal/sertifikasi/${id}`),
    download: (id)          => API.get(`/lpk-portal/sertifikasi/${id}/download`, { responseType: 'blob' }),
  },

  // ── Laporan ─────────────────────────────────────────────
  laporan: {
    getDashboard: (params = '') => API.get(`/lpk-portal/laporan/dashboard?${params}`),
  },

  // ── Tenaga Kerja (read-only untuk pencarian peserta) ────
  tenagaKerja: {
    getAll: (paginate = 'true', search = '') =>
      API.get(`/lpk-portal/tenaga-kerja?paginate=${paginate}&search=${search}`),
  },
};


/**
 * Pemagangan API Endpoints
 */
export const pemaganganAPI = {
  getAll: (params = '') => API.get(`/pemagangan?${params}`),
  getById: (id) => API.get(`/pemagangan/${id}`),
  create: (data) => API.post('/pemagangan', data),
  update: (id, data) => API.put(`/pemagangan/${id}`, data),
  delete: (id) => API.delete(`/pemagangan/${id}`),
};

/**
 * Sertifikasi API Endpoints
 */
export const sertifikasiAPI = {
  getAll: (params = '') => API.get(`/sertifikasi?${params}`),
  getById: (id) => API.get(`/sertifikasi/${id}`),
  create: (formData) => API.post('/sertifikasi', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => API.post(`/sertifikasi/${id}?_method=PUT`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete(`/sertifikasi/${id}`),
  download: (id) => API.get(`/sertifikasi/${id}/download`, { responseType: 'blob' }),
};

// ── Perusahaan Mitra ──────────────────────────────────────────
export const perusahaanAPI = {
  getAll:  (search = '') => API.get(`/perusahaan-mitra?search=${search}`),
  getById: (id)          => API.get(`/perusahaan-mitra/${id}`),
  create:  (data)        => API.post('/perusahaan-mitra', data),
  update:  (id, data)    => API.put(`/perusahaan-mitra/${id}`, data),
  delete:  (id)          => API.delete(`/perusahaan-mitra/${id}`),
};

// ── LPK ──────────────────────────────────────────
export const lpkAPI = {
  getAll: (paginate = 'true') => API.get(`/lpk?paginate=${paginate}`),
  getById: (id) => API.get(`/lpk/${id}`),
  create: (data) => API.post('/lpk', data),
  update: (id, data) => API.put(`/lpk/${id}`, data),
  delete: (id) => API.delete(`/lpk/${id}`),
};

// ── Job Fair ──────────────────────────────────────────
export const jobFairAPI = {
  getAll: (params = '') => API.get(`/job-fair?${params}`),
  getById: (id) => API.get(`/job-fair/${id}`),
  create: (data) => API.post('/job-fair', data),
  update: (id, data) => API.put(`/job-fair/${id}`, data),
  delete: (id) => API.delete(`/job-fair/${id}`),
};

// ── Tenaga Kerja ──────────────────────────────────────────
export const tenagaKerjaAPI = {
  getAll: (paginate = 'true', search = '', page = 1) => API.get(`/tenaga-kerja?paginate=${paginate}&search=${search}&page=${page}`),
  getById: (id) => API.get(`/tenaga-kerja/${id}`),
  create: (data) => API.post('/tenaga-kerja', data),
  update: (id, data) => API.put(`/tenaga-kerja/${id}`, data),
  delete: (id) => API.delete(`/tenaga-kerja/${id}`),
};

// ── Peserta Pelatihan ──────────────────────────────────────────
export const pesertaPelatihanAPI = {
  getAll: (params = '') => API.get(`/peserta-pelatihan?${params}`),
  getById: (id) => API.get(`/peserta-pelatihan/${id}`),
  create: (formData) => API.post('/peserta-pelatihan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // PUT multipart tidak bisa, gunakan POST + _method=PUT
  update: (id, formData) => API.post(`/peserta-pelatihan/${id}?_method=PUT`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => API.delete(`/peserta-pelatihan/${id}`),
  importPreview: (data) => API.post('/peserta-pelatihan/import-preview', data),
  importCommit: (data) => API.post('/peserta-pelatihan/import-commit', data),
  getImportHistory: (params = '') => API.get(`/peserta-pelatihan/import-history?${params}`),
};

// ── Laporan ──────────────────────────────────────────
export const laporanAPI = {
  getDashboard: (params = '') => API.get(`/laporan/dashboard?${params}`),
};

// ── Tracer Study ──────────────────────────────────────────
export const tracerStudyAPI = {
  getAll:  (search = '') => API.get(`/tracer-study?search=${search}`),
  getById: (id)          => API.get(`/tracer-study/${id}`),
  create:  (data)        => API.post('/tracer-study', data),
  update:  (id, data)    => API.put(`/tracer-study/${id}`, data),
  delete:  (id)          => API.delete(`/tracer-study/${id}`),
};

// ── Users Management ──────────────────────────────────────────
export const usersAPI = {
  getAll: (search = '', role = 'all', page = 1) => {
    const params = new URLSearchParams({ page });
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);
    return API.get(`/users?${params.toString()}`);
  },
  getById: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

export default API;
