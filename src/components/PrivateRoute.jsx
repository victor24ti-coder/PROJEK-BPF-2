import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute - Komponen untuk melindungi route yang memerlukan autentikasi
 * 
 * Fitur:
 * - Cek apakah user sudah authenticated
 * - Redirect ke /sign-in jika belum login
 * - Loading state saat cek autentikasi
 */

export function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Jika masih loading, tampilkan loading screen
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Jika tidak authenticated, redirect ke sign-in
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Render children jika authenticated
  return children;
}

/**
 * PublicRoute - Komponen untuk route publik (sign-in, sign-up)
 * Redirect ke dashboard jika sudah login
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Jika sudah authenticated, redirect ke dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render children jika belum authenticated
  return children;
}
