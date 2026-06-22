import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute, PublicRoute } from './components/PrivateRoute';
import { AuthLayout } from './components/layout/AuthLayout';
import { Sidebar, TopBar, MobileOverlay } from './components/layout/Sidebar';
import LoadingFallback from './components/LoadingFallback';

/**
 * Lazy Load Components - Untuk code splitting dan performance optimization
 * 
 * Setiap page di-load hanya ketika dibutuhkan, bukan saat aplikasi dimulai
 */
const DashboardPage = lazy(() => import('./components/pages/DashboardPage'));
const PelatihanPage = lazy(() => import('./components/pages/PelatihanPage'));
const PemaganganPage = lazy(() => import('./components/pages/PemaganganPage'));
const SertifikasiPage = lazy(() => import('./components/pages/SertifikasiPage'));
const LPKPage = lazy(() => import('./components/pages/LPKPage'));
const PerusahaanPage = lazy(() => import('./components/pages/PerusahaanPage'));
const JobFairPage = lazy(() => import('./components/pages/JobFairPage'));
const DocsPage = lazy(() => import('./components/pages/DocsPage'));
const PelatihanDetailPage = lazy(() => import('./components/pages/PelatihanDetailPage'));
const TracerStudyPage = lazy(() => import('./components/pages/TracerStudyPage'));

// Sign In dan Sign Up juga di-lazy load, tapi bisa di-import langsung jika perlu
const SignInPage = lazy(() => import('./components/pages/SignInPage'));
const SignUpPage = lazy(() => import('./components/pages/SignUpPage'));

/**
 * PageTitleMap - Mapping antara path dan judul halaman
 */
const pageTitleMap = {
  '/': 'Dashboard',
  '/pelatihan': 'Pelatihan',
  '/pemagangan': 'Pemagangan',
  '/sertifikasi': 'Sertifikasi',
  '/lpk': 'LPK',
  '/perusahaan': 'Perusahaan',
  '/jobfair': 'Job Fair',
  '/tracer-study': 'Tracer Study',
  '/docs': 'Documentation',
};

/**
 * NotFoundPage - Halaman 404 untuk route yang tidak ditemukan
 */
function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-stone-900 mb-4">404</h1>
        <p className="text-xl text-stone-600 mb-8">Page Not Found</p>
        <p className="text-stone-500">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}

/**
 * DashboardLayout - Layout untuk dashboard dengan sidebar dan topbar
 * 
 * Multi-layout pattern: Sidebar + TopBar + Content
 */
function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  let pageTitle = pageTitleMap[location.pathname] || 'Dashboard';
  if (location.pathname.startsWith('/pelatihan/')) {
    pageTitle = 'Detail Pelatihan';
  }

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileOverlay isOpen={mobileMenuOpen} onClose={handleMobileMenuClose} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={pageTitle} onMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-hidden">
          {/* Suspense untuk lazy loading pages */}
          <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/pelatihan" element={<PelatihanPage />} />
                <Route path="/pemagangan" element={<PemaganganPage />} />
                <Route path="/sertifikasi" element={<SertifikasiPage />} />
                <Route path="/lpk" element={<LPKPage />} />
                <Route path="/perusahaan" element={<PerusahaanPage />} />
                <Route path="/jobfair" element={<JobFairPage />} />
                <Route path="/tracer-study" element={<TracerStudyPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/pelatihan/:id" element={<PelatihanDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/**
 * AppRoutes - Routes utama aplikasi dengan logic autentikasi
 * 
 * Nested Routes Pattern:
 * - Routes untuk auth dibungkus dengan PublicRoute
 * - Routes untuk dashboard dibungkus dengan PrivateRoute
 * - Menggunakan Suspense untuk lazy loading
 */
function AppRoutes() {
  const { isLoading } = useAuth();

  // Jika auth masih loading, tampilkan loading fallback
  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      {/* Public Routes - Auth Layout */}
      <Route
        path="/sign-in"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SignInPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/sign-up"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SignUpPage />
            </Suspense>
          </PublicRoute>
        }
      />

      {/* Private Routes - Dashboard Layout dengan nested routes */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

/**
 * App - Root komponen aplikasi
 *
 * Struktur:
 * - BrowserRouter untuk routing
 * - AuthProvider untuk state management autentikasi
 * - AppRoutes yang berisi semua routes dengan lazy loading
 * 
 * Fitur:
 * 1. Multi Layout & Nested Routes:
 *    - AuthLayout untuk sign-in/sign-up
 *    - DashboardLayout untuk dashboard pages
 *    - Nested routes di dalam DashboardLayout
 * 
 * 2. Lazy Loading + Suspense:
 *    - Setiap page di-lazy load dengan React.lazy()
 *    - Suspense wrapper dengan LoadingFallback
 * 
 * 3. Login API + Axios:
 *    - AuthContext menyediakan login/signup functions
 *    - API service dengan axios interceptors
 *    - PrivateRoute untuk protect dashboard routes
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}