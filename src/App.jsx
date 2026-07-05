import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivateRoute, PublicRoute } from './components/PrivateRoute';
import { AuthLayout } from './components/layout/AuthLayout';
import { Sidebar, TopBar, MobileOverlay } from './components/layout/Sidebar';
import StafLayout from './components/layout/StafLayout';
import LpkLayout from './components/layout/LpkLayout';
import LoadingFallback from './components/LoadingFallback';
import Pelatihan from "./components/pages/lpk/Pelatihan/Index";
import PesertaPelatihan from "./components/pages/lpk/PesertaPelatihan/Index";
import Sertifikasi from "./components/pages/lpk/Sertifikasi/Index";
import Laporan from "./components/pages/lpk/Laporan/Index";
import Dashboard from "./components/pages/lpk/Dashboard";
import Profile from "./components/pages/lpk/Profile";
import PelatihanCreate from "./components/pages/lpk/Pelatihan/Create";
import PelatihanEdit from "./components/pages/lpk/Pelatihan/Edit";
import PelatihanDetail from "./components/pages/lpk/Pelatihan/Detail";
import PesertaCreate from "./components/pages/lpk/PesertaPelatihan/Create";
import PesertaEdit from "./components/pages/lpk/PesertaPelatihan/Edit";
import PesertaDetail from "./components/pages/lpk/PesertaPelatihan/Detail";
import SertifikasiCreate from "./components/pages/lpk/Sertifikasi/Create";
import SertifikasiEdit from "./components/pages/lpk/Sertifikasi/Edit";
import SertifikasiDetail from "./components/pages/lpk/Sertifikasi/Detail";
// Staf pages
import StafDashboard from "./components/pages/staf/DashboardPage";
import StafPelatihan from "./components/pages/staf/PelatihanPage";
import StafProfile from "./components/pages/staf/ProfilePage";


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
const TenagaKerjaPage = lazy(() => import('./components/pages/TenagaKerjaPage'));
const LaporanPage = lazy(() => import('./components/pages/LaporanPage'));
const UsersPage = lazy(() => import('./components/pages/UsersPage'));
const PesertaPelatihanPage = lazy(() => import('./components/pages/staf/PesertaPelatihanPage'));
const StafPesertaCreate = lazy(() => import('./components/pages/staf/PesertaPelatihanCreate'));
const StafPesertaEdit = lazy(() => import('./components/pages/staf/PesertaPelatihanEdit'));
const StafPesertaDetail = lazy(() => import('./components/pages/staf/PesertaPelatihanDetail'));


// Sign In dan Sign Up juga di-lazy load, tapi bisa di-import langsung jika perlu
const SignInPage = lazy(() => import('./components/pages/SignInPage'));
const SignUpPage = lazy(() => import('./components/pages/SignUpPage'));

/**
 * PageTitleMap - Mapping antara path dan judul halaman
 */
const pageTitleMap = {
  '/': 'Dashboard',
  '/users': 'Manajemen Pengguna',
  '/pelatihan': 'Pelatihan',
  '/pemagangan': 'Pemagangan',
  '/sertifikasi': 'Sertifikasi',
  '/lpk-data': 'LPK',
  '/perusahaan': 'Perusahaan',
  '/jobfair': 'Job Fair',
  '/tracer-study': 'Tracer Study',
  '/tenaga-kerja': 'Tenaga Kerja',
  '/laporan': 'Laporan',
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar title={pageTitle} onMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Suspense untuk lazy loading pages */}
          <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/pelatihan" element={<PelatihanPage />} />
                <Route path="/pemagangan" element={<PemaganganPage />} />
                <Route path="/sertifikasi" element={<SertifikasiPage />} />
                <Route path="/lpk-data" element={<LPKPage />} />
                <Route path="/perusahaan" element={<PerusahaanPage />} />
                <Route path="/jobfair" element={<JobFairPage />} />
                <Route path="/tracer-study" element={<TracerStudyPage />} />
                <Route path="/tenaga-kerja" element={<TenagaKerjaPage />} />
                <Route path="/laporan" element={<LaporanPage />} />
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

      {/* Private Routes - LPK Layout */}
      <Route
        path="/lpk/*"
        element={
          <PrivateRoute allowedRoles={['lpk']}>
            <LpkLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/lpk/dashboard" replace />} />
        <Route path="dashboard"                    element={<Dashboard />} />
        <Route path="profile"                      element={<Profile />} />
        <Route path="pelatihan"                    element={<Pelatihan />} />
        <Route path="pelatihan/create"             element={<PelatihanCreate />} />
        <Route path="pelatihan/edit/:id"           element={<PelatihanEdit />} />
        <Route path="pelatihan/detail/:id"         element={<PelatihanDetail />} />
        <Route path="peserta-pelatihan"            element={<PesertaPelatihan />} />
        <Route path="peserta-pelatihan/create"     element={<PesertaCreate />} />
        <Route path="peserta-pelatihan/edit/:id"   element={<PesertaEdit />} />
        <Route path="peserta-pelatihan/detail/:id" element={<PesertaDetail />} />
        <Route path="sertifikasi"                  element={<Sertifikasi />} />
        <Route path="sertifikasi/create"           element={<SertifikasiCreate />} />
        <Route path="sertifikasi/edit/:id"         element={<SertifikasiEdit />} />
        <Route path="sertifikasi/detail/:id"       element={<SertifikasiDetail />} />
        <Route path="laporan"                      element={<Laporan />} />
      </Route>

      {/* Private Routes - Staf Layout */}
      <Route
        path="/staf/*"
        element={
          <PrivateRoute allowedRoles={['staf']}>
            <StafLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/staf/dashboard" replace />} />
        <Route path="dashboard"         element={<Suspense fallback={<LoadingFallback />}><StafDashboard /></Suspense>} />
        <Route path="tenaga-kerja"       element={<Suspense fallback={<LoadingFallback />}><TenagaKerjaPage /></Suspense>} />
        <Route path="pelatihan"          element={<Suspense fallback={<LoadingFallback />}><StafPelatihan /></Suspense>} />
        <Route path="peserta-pelatihan"          element={<Suspense fallback={<LoadingFallback />}><PesertaPelatihanPage /></Suspense>} />
        <Route path="peserta-pelatihan/create"   element={<Suspense fallback={<LoadingFallback />}><StafPesertaCreate /></Suspense>} />
        <Route path="peserta-pelatihan/edit/:id" element={<Suspense fallback={<LoadingFallback />}><StafPesertaEdit /></Suspense>} />
        <Route path="peserta-pelatihan/detail/:id" element={<Suspense fallback={<LoadingFallback />}><StafPesertaDetail /></Suspense>} />
        <Route path="sertifikasi"        element={<Suspense fallback={<LoadingFallback />}><SertifikasiPage /></Suspense>} />
        <Route path="perusahaan"         element={<Suspense fallback={<LoadingFallback />}><PerusahaanPage /></Suspense>} />
        <Route path="job-fair"           element={<Suspense fallback={<LoadingFallback />}><JobFairPage /></Suspense>} />
        <Route path="tracer-study"       element={<Suspense fallback={<LoadingFallback />}><TracerStudyPage /></Suspense>} />
        <Route path="laporan"            element={<Suspense fallback={<LoadingFallback />}><LaporanPage /></Suspense>} />
        <Route path="profil"             element={<Suspense fallback={<LoadingFallback />}><StafProfile /></Suspense>} />
      </Route>

      {/* Private Routes - Dashboard Layout (Admin) */}
      <Route
        path="/*"
        element={
          <PrivateRoute allowedRoles={['admin']}>
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