import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

/**
 * Auth Context - Untuk state management autentikasi
 * 
 * Menyediakan:
 * - user state
 * - isAuthenticated state
 * - isLoading state
 * - login function
 * - signup function
 * - logout function
 * - checkAuth function untuk verifikasi auth saat load
 */

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cek autentikasi saat aplikasi dimulai
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);

      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Simpan ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login gagal. Silakan coba lagi.';
      
      if (err.response?.data) {
        // Pesan error dari backend (misal: "Email atau password salah")
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        // Laravel validation errors (misal: { errors: { email: ["..."] } })
        if (err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        }
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Signup function
   */
  const signup = useCallback(async (userData) => {
    try {
      setError(null);

      const response = await authAPI.signup(userData);
      const { token, user } = response.data;

      // Simpan ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup gagal. Silakan coba lagi.';
      setError(errorMessage);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook untuk menggunakan Auth Context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
}
