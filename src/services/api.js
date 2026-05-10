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
    // Jika token expired, redirect ke login
    if (error.response?.status === 401) {
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
  login: (username, password) => {
    if (username === 'test' && password === 'test123') {
      return Promise.resolve({
        data: {
          accessToken: 'mock-token-test-123',
          refreshToken: 'mock-refresh-test-123',
          id: 999,
          username: 'test',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          image: '',
        },
      });
    }

    return axios.post('https://dummyjson.com/user/login', {
      username,
      password,
      expiresInMins: 60,
    });
  },
  signup: (userData) => {
    return API.post('/auth/signup', userData);
  },
  logout: () => {
    return API.post('/auth/logout');
  },
  getCurrentUser: () => {
    return API.get('/auth/me');
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

export default API;
