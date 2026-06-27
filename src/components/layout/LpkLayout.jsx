import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

import {
  Sidebar,
  TopBar,
  MobileOverlay,
} from "./Sidebar";

const pageTitleMap = {
  "/lpk/dashboard": "Dashboard",
  "/lpk/profile": "Profil LPK",
  "/lpk/pelatihan": "Pelatihan",
  "/lpk/pelatihan/create": "Tambah Pelatihan",
  "/lpk/peserta-pelatihan": "Peserta Pelatihan",
  "/lpk/peserta-pelatihan/create": "Daftarkan Peserta",
  "/lpk/sertifikasi": "Sertifikasi",
  "/lpk/laporan": "Laporan",
};

export default function LpkLayout() {
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle =
    pageTitleMap[location.pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar Desktop */}

      <div className="hidden lg:flex flex-shrink-0">

        <Sidebar />

      </div>

      {/* Sidebar Mobile */}

      <MobileOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main */}

      <div className="flex-1 flex flex-col overflow-hidden">

        <TopBar
          title={pageTitle}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-auto p-6">

          <Outlet />

        </main>

      </div>

    </div>
  );
}