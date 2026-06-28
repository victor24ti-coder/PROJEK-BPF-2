import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sidebar, TopBar, MobileOverlay } from "./Sidebar";

const pageTitleMap = {
  "/staf/dashboard":         "Dashboard",
  "/staf/tenaga-kerja":      "Tenaga Kerja",
  "/staf/pelatihan":         "Pelatihan",
  "/staf/peserta-pelatihan": "Peserta Pelatihan",
  "/staf/sertifikasi":       "Sertifikasi",
  "/staf/perusahaan":        "Perusahaan Mitra",
  "/staf/job-fair":          "Job Fair",
  "/staf/tracer-study":      "Tracer Study",
  "/staf/laporan":           "Laporan",
  "/staf/profil":            "Profil",
};

export default function StafLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = pageTitleMap[location.pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>
      <MobileOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={pageTitle}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
