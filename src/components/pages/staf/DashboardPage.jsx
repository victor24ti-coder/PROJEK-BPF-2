import { useEffect, useState } from "react";
import {
  Users, BookOpen, Award, Building2, Bell, Compass,
  UserCheck, TrendingUp, Activity, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line
} from "recharts";
import API, { laporanAPI } from "../../../services/api";

/* ── Kartu Ringkasan ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</p>
        {loading
          ? <div className="h-7 w-16 bg-stone-100 animate-pulse rounded mt-1" />
          : <p className="text-2xl font-bold text-stone-900">{value ?? 0}</p>
        }
      </div>
    </div>
  );
}

/* ── Aktivitas Terbaru placeholder ───────────────────────────── */
function AktivitasItem({ icon: Icon, text, time, color }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className={`p-2 rounded-lg ${color} mt-0.5`}>
        <Icon size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-700">{text}</p>
        <p className="text-xs text-stone-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export default function StafDashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await laporanAPI.getDashboard();
      const d = res.data.data ?? res.data ?? {};
      setStats(d.summary ?? d);
      setChartData(d.grafik?.peserta_per_pelatihan ?? d.grafik?.bulanan ?? []);
    } catch {
      // Fallback: coba panggil endpoint individual
      try {
        const [tk, plt, pp, sert, prsh, jf] = await Promise.allSettled([
          API.get("/tenaga-kerja?paginate=false"),
          API.get("/pelatihan?paginate=false"),
          API.get("/peserta-pelatihan?paginate=false"),
          API.get("/sertifikasi?paginate=false"),
          API.get("/perusahaan-mitra?paginate=false"),
          API.get("/job-fair?paginate=false"),
        ]);
        const count = (r) => {
          if (r.status !== "fulfilled") return 0;
          const d = r.value.data.data;
          return Array.isArray(d) ? d.length : (d?.total ?? d?.data?.length ?? 0);
        };
        setStats({
          total_tenaga_kerja: count(tk),
          total_pelatihan: count(plt),
          total_peserta: count(pp),
          total_sertifikasi: count(sert),
          total_perusahaan: count(prsh),
          total_job_fair: count(jf),
        });
      } catch {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = [
    { icon: Users,     label: "Tenaga Kerja",      value: stats?.total_tenaga_kerja, color: "bg-blue-500" },
    { icon: BookOpen,  label: "Pelatihan",          value: stats?.total_pelatihan,   color: "bg-indigo-500" },
    { icon: UserCheck, label: "Peserta Pelatihan",  value: stats?.total_peserta,     color: "bg-violet-500" },
    { icon: Award,     label: "Sertifikasi",        value: stats?.total_sertifikasi, color: "bg-emerald-500" },
    { icon: Building2, label: "Perusahaan Mitra",   value: stats?.total_perusahaan,  color: "bg-orange-500" },
    { icon: Bell,      label: "Job Fair",           value: stats?.total_job_fair,    color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard Staf</h1>
          <p className="text-sm text-stone-500 mt-1">Ringkasan data operasional harian</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-2 rounded-lg hover:bg-stone-50 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          Gagal memuat data. Pastikan server backend berjalan.
        </div>
      )}

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Grafik & Aktivitas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Grafik Peserta per Pelatihan */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-blue-500" />
            <h3 className="font-semibold text-stone-800">Peserta per Pelatihan</h3>
          </div>
          {loading ? (
            <div className="h-56 flex items-center justify-center text-stone-400 text-sm">Memuat grafik...</div>
          ) : chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-stone-400 text-sm">Tidak ada data grafik</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="nama_pelatihan" axisLine={false} tickLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip cursor={{ fill: "#f3f4f6" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)" }} />
                  <Bar dataKey="peserta" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-stone-800">Aksi Cepat</h3>
          </div>
          <div className="space-y-2">
            {[
              { href: "/staf/tenaga-kerja",      label: "Kelola Tenaga Kerja",    icon: Users,     color: "bg-blue-500" },
              { href: "/staf/job-fair",           label: "Kelola Job Fair",        icon: Bell,      color: "bg-rose-500" },
              { href: "/staf/perusahaan",         label: "Kelola Perusahaan",      icon: Building2, color: "bg-orange-500" },
              { href: "/staf/tracer-study",       label: "Tracer Study Alumni",    icon: Compass,   color: "bg-teal-500" },
              { href: "/staf/laporan",            label: "Lihat Laporan",          icon: TrendingUp, color: "bg-indigo-500" },
            ].map(({ href, label, icon: Icon, color }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition group"
              >
                <div className={`p-1.5 rounded-lg ${color}`}>
                  <Icon size={13} className="text-white" />
                </div>
                <span className="text-sm text-stone-700 group-hover:text-stone-900">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
