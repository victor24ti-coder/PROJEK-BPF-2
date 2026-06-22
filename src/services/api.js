import axios from 'axios';

/**
 * API Service - Konfigurasi Axios Instance
 * 
 * File ini mengatur base URL, interceptors, dan export API endpoints
 * untuk digunakan di seluruh aplikasi
 */

// Membuat instance axios dengan konfigurasi default
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
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
    // Jika token expired (dan bukan request login), redirect ke login
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/login')) {
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
    return API.post('/auth/signup', userData);
  },
  logout: () => {
    return API.post('/logout');
  },
  getCurrentUser: () => {
    return API.get('/me');
  },
};

/**
 * Pelatihan API Endpoints
 */
export const pelatihanAPI = {
  getAll: () => API.get('/pelatihan'),
  getById: (id) => API.get(`/pelatihan/${id}`),
  create: (data) => API.post('/pelatihan', data),
  update: (id, data) => API.put(`/pelatihan/${id}`, data),
  delete: (id) => API.delete(`/pelatihan/${id}`),
};

/**
 * Pemagangan API Endpoints
 */
export const pemaganganAPI = {
  getAll: () => API.get('/pemagangan'),
  getById: (id) => API.get(`/pemagangan/${id}`),
  create: (data) => API.post('/pemagangan', data),
  update: (id, data) => API.put(`/pemagangan/${id}`, data),
  delete: (id) => API.delete(`/pemagangan/${id}`),
};

/**
 * Sertifikasi API Endpoints
 */
export const sertifikasiAPI = {
  getAll: () => API.get('/sertifikasi'),
  getById: (id) => API.get(`/sertifikasi/${id}`),
  create: (data) => API.post('/sertifikasi', data),
  update: (id, data) => API.put(`/sertifikasi/${id}`, data),
  delete: (id) => API.delete(`/sertifikasi/${id}`),
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
  getAll: () => API.get('/job-fair'),
  getById: (id) => API.get(`/job-fair/${id}`),
  create: (data) => API.post('/job-fair', data),
  update: (id, data) => API.put(`/job-fair/${id}`, data),
  delete: (id) => API.delete(`/job-fair/${id}`),
};

// ── Tenaga Kerja ──────────────────────────────────────────
export const tenagaKerjaAPI = {
  getAll: (paginate = 'true', search = '') => API.get(`/tenaga-kerja?paginate=${paginate}&search=${search}`),
  getById: (id) => API.get(`/tenaga-kerja/${id}`),
  create: (data) => API.post('/tenaga-kerja', data),
  update: (id, data) => API.put(`/tenaga-kerja/${id}`, data),
  delete: (id) => API.delete(`/tenaga-kerja/${id}`),
};

// ── Peserta Pelatihan ──────────────────────────────────────────
export const pesertaPelatihanAPI = {
  create: (data)        => API.post('/peserta-pelatihan', data),
  update: (id, data)    => API.put(`/peserta-pelatihan/${id}`, data),
  delete: (id)          => API.delete(`/peserta-pelatihan/${id}`),
};

// ── Tracer Study ──────────────────────────────────────────
export const tracerStudyAPI = {
  getAll:  (search = '') => API.get(`/tracer-study?search=${search}`),
  getById: (id)          => API.get(`/tracer-study/${id}`),
  create:  (data)        => API.post('/tracer-study', data),
  update:  (id, data)    => API.put(`/tracer-study/${id}`, data),
  delete:  (id)          => API.delete(`/tracer-study/${id}`),
};

export default API;
