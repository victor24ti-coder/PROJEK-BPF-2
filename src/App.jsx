import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar, TopBar, MobileOverlay } from "./components/layout/Sidebar";
import { DashboardPage } from "./components/pages/DashboardPage";
import { PelatihanPage } from "./components/pages/PelatihanPage";
import { PemaganganPage } from "./components/pages/PemaganganPage";
import { SertifikasiPage } from "./components/pages/SertifikasiPage";
import { LPKPage } from "./components/pages/LPKPage";
import { PerusahaanPage } from "./components/pages/PerusahaanPage";
import { JobFairPage } from "./components/pages/JobFairPage";
import { SignInPage } from "./components/pages/SignInPage";
import { SignUpPage } from "./components/pages/SignUpPage";
import { DocsPage } from "./components/pages/DocsPage";

/**
 * PageTitleMap - Mapping antara path dan judul halaman
 */
const pageTitleMap = {
  "/": "Dashboard",
  "/pelatihan": "Pelatihan",
  "/pemagangan": "Pemagangan",
  "/sertifikasi": "Sertifikasi",
  "/lpk": "LPK",
  "/perusahaan": "Perusahaan",
  "/jobfair": "Job Fair",
  "/sign-in": "Sign In",
  "/sign-up": "Sign Up",
  "/docs": "Documentation",
};

/**
 * MainLayout - Komponen layout utama dengan sidebar, topbar, dan routes
 */
function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitleMap[location.pathname] || "Dashboard";

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
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pelatihan" element={<PelatihanPage />} />
            <Route path="/pemagangan" element={<PemaganganPage />} />
            <Route path="/sertifikasi" element={<SertifikasiPage />} />
            <Route path="/lpk" element={<LPKPage />} />
            <Route path="/perusahaan" element={<PerusahaanPage />} />
            <Route path="/jobfair" element={<JobFairPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * App - Root komponen aplikasi dengan React Router
 *
 * Struktur:
 * - BrowserRouter untuk routing
 * - MainLayout yang berisi Sidebar, TopBar, dan Routes
 */
export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}