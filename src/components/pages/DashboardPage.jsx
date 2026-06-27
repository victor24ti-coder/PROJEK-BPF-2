import { useState, useEffect } from "react";
import { StatsGrid } from "../dashboard/StatsGrid";
import { ProjectsTable } from "../dashboard/ProjectsTable";
import { ChartsShowcase } from "../dashboard/ChartsShowcase";
import { laporanAPI } from "../../services/api";
import { Loader2 } from "lucide-react";

/**
 * DashboardPage - Halaman utama dashboard
 * Berisi hero card, stats grid, projects table, dan charts showcase
 */
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await laporanAPI.getDashboard();
        setData(res.data);
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Lihat Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Components */}
      {data && (
        <>
          <StatsGrid stats={data.stats} dataPeserta={data.data_peserta} />
          <ProjectsTable dataPelatihan={data.data_pelatihan} />
          <ChartsShowcase grafik={data.grafik} />
        </>
      )}
    </div>
  );
}
