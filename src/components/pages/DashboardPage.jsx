import { StatsGrid } from "../dashboard/StatsGrid";
import { ProjectsTable } from "../dashboard/ProjectsTable";
import { ChartsShowcase } from "../dashboard/ChartsShowcase";

/**
 * DashboardPage - Halaman utama dashboard
 * Berisi hero card, stats grid, projects table, dan charts showcase
 */
export function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Hero Card */}
      <div className="relative mb-8 border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm">
        <div
          className="relative h-64 bg-cover bg-top bg-no-repeat"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop)",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 p-8 flex items-center h-full">
            <div className="max-w-lg">
              <h2 className="text-3xl font-bold text-white mb-4">
                Sistem Informasi Ketenagakerjaan
              </h2>

              <p className="text-stone-200 text-lg mb-6 leading-relaxed">
                Dashboard monitoring data pelatihan, tenaga kerja, dan serapan
                kerja di Provinsi Riau.
              </p>

              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Lihat Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Components */}
      <StatsGrid />
      <ProjectsTable />
      <ChartsShowcase />
    </div>
  );
}
