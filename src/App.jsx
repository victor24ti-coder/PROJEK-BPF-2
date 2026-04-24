import { useState } from "react";
import { Sidebar, TopBar, MobileOverlay } from "./components/layout/Sidebar";
import { DashboardPage } from "./components/pages/DashboardPage";

/**
 * App - Root komponen aplikasi Material Shadcn Dashboard
 *
 * Struktur:
 * - Sidebar kiri (navigasi)
 * - Konten utama (TopBar + halaman)
 * - MobileOverlay untuk sidebar mobile
 */
export default function App() {
  const [activePath, setActivePath] = useState("#dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = {
    "#dashboard": "Dashboard",
    "#profile": "Profile",
    "#tables": "Tables",
    "#notifications": "Notifications",
    "#subscriptions": "Subscriptions",
    "#sign-in": "Sign In",
    "#sign-up": "Sign Up",
    "#docs": "Documentation",
  }[activePath] || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar activePath={activePath} onNavigate={setActivePath} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePath={activePath}
        onNavigate={setActivePath}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={pageTitle} onMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-hidden">
          {activePath === "#dashboard" && <DashboardPage />}

          {/* Placeholder pages */}
          {activePath !== "#dashboard" && (
            <div className="h-full flex items-center justify-center text-stone-500">
              <div className="text-center">
                <div className="text-5xl mb-4">🚧</div>
                <p className="text-lg font-medium text-stone-700">
                  {pageTitle} Page
                </p>
                <p className="text-sm text-stone-500 mt-1">
                  Halaman ini belum diimplementasi. Fokus saat ini: Dashboard.
                </p>
                <button
                  onClick={() => setActivePath("#dashboard")}
                  className="mt-4 px-4 py-2 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}