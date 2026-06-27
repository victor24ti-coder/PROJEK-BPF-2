import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Dapatkan path home berdasarkan role user
 */
function getHomeByRole(user) {
  switch (user?.role) {
    case 'admin':        return '/';
    case 'staf':         return '/staf/dashboard';
    case 'lpk':          return '/lpk/dashboard';
    case 'pencari_kerja': return '/jpk/dashboard';
    default:             return '/';
  }
}

/**
 * PrivateRoute - Komponen untuk melindungi route yang memerlukan autentikasi
 * @param {Object} props
 * @param {ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - Role yang diizinkan akses route ini
 */
export function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  // Jika ada role restriction dan user tidak punya role yang diizinkan
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomeByRole(user)} replace />;
  }

  // Render children jika authenticated (dan role sesuai jika ada restriction)
  return children;
}

/**
 * PublicRoute - Redirect ke dashboard sesuai role jika sudah login
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  // Jika sudah authenticated, redirect ke dashboard sesuai role
  if (isAuthenticated) {
    return <Navigate to={getHomeByRole(user)} replace />;
  }

  // Render children jika belum authenticated
  return children;
}

