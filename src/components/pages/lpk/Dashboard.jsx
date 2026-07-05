import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { lpkPortalAPI } from "../../../services/api";
import {
  BookOpen, Activity, Users, UserCheck, Award, TrendingUp,
  Calendar, Clock, Loader2, AlertTriangle, ArrowUpRight,
  BarChart3, PieChart as PieChartIcon, ChevronRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    lpkPortalAPI.laporan.getDashboard()
      .then(res => setData(res.data))
      .catch(() => setError("Gagal memuat data dashboard. Periksa koneksi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-blue-600">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="font-medium animate-pulse">Memuat Dashboard...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl flex items-center gap-3 shadow-sm">
      <AlertTriangle className="w-6 h-6" /> {error}
    </div>
  );

  // Kalkulasi statistik yang diminta
  const statsResponse = data.stats;
  const dataPelatihan = data.data_pelatihan || [];
  const dataPeserta = data.data_peserta || [];

  const pelatihanAktif = dataPelatihan.filter(p => p.status === 'aktif').length;

  // Mencari ID pelatihan yang aktif (kolom 'status' di database)
  const idPelatihanAktif = dataPelatihan.filter(p => p.status === 'aktif').map(p => p.id);
  const pesertaAktif = dataPeserta.filter(p => idPelatihanAktif.includes(p.pelatihan_id)).length;

  const totalLulus = dataPeserta.filter(p => p.status_peserta === 'lulus').length;
  const totalTidakLulus = dataPeserta.filter(p => p.status_peserta === 'tidak_lulus').length;
  const tingkatKelulusan = dataPeserta.length > 0 ? ((totalLulus / dataPeserta.length) * 100).toFixed(1) : 0;

  const stats = [
    { label: "Total Pelatihan",   value: statsResponse.total_pelatihan,  icon: BookOpen,   bgColor: "bg-blue-50",    iconColor: "text-blue-600",    accentColor: "bg-blue-500" },
    { label: "Pelatihan Aktif",   value: pelatihanAktif,                 icon: Activity,   bgColor: "bg-indigo-50",  iconColor: "text-indigo-600",  accentColor: "bg-indigo-500" },
    { label: "Total Peserta",     value: statsResponse.total_peserta,    icon: Users,      bgColor: "bg-emerald-50", iconColor: "text-emerald-600", accentColor: "bg-emerald-500" },
    { label: "Peserta Aktif",     value: pesertaAktif,                   icon: UserCheck,  bgColor: "bg-teal-50",    iconColor: "text-teal-600",    accentColor: "bg-teal-500" },
    { label: "Sertifikat Terbit", value: statsResponse.total_sertifikat, icon: Award,      bgColor: "bg-purple-50",  iconColor: "text-purple-600",  accentColor: "bg-purple-500" },
    { label: "Tingkat Kelulusan", value: `${tingkatKelulusan}%`,         icon: TrendingUp, bgColor: "bg-amber-50",   iconColor: "text-amber-600",   accentColor: "bg-amber-500" },
  ];

  const kelulusanData = [
    { name: 'Lulus', value: totalLulus },
    { name: 'Tidak Lulus', value: totalTidakLulus },
  ];

  // Greeting berdasarkan jam
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER SECTION                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="relative">
          {/* Background cover */}
          <div className="h-28 sm:h-32 relative overflow-hidden">
            <img
              src="/riau-bg.jpg"
              alt="Perpustakaan Soeman HS, Riau"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-800/70 via-blue-600/50 to-blue-500/60" />
          </div>

          {/* Content overlay */}
          <div className="relative px-6 sm:px-8 pb-6 -mt-16 z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Greeting */}
              <div>
                <p className="text-xs font-semibold tracking-wider text-white/80 uppercase mb-1">{greeting}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">
                  {user?.name || "LPK"} 👋
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Kelola seluruh aktivitas pelatihan melalui dashboard ini.
                </p>
              </div>

              {/* Date & Time Widget */}
              <div className="flex gap-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-stone-200 shadow-sm w-fit">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Tanggal</p>
                    <p className="text-xs font-bold text-stone-800">{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="w-px bg-stone-200"></div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider">Waktu</p>
                    <p className="text-xs font-bold text-stone-800 font-mono tracking-wider">{currentTime.toLocaleTimeString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STATISTICS CARDS                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 relative overflow-hidden group cursor-default"
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${s.bgColor} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
              </div>
              <h4 className="text-2xl font-bold text-stone-800 tracking-tight">{s.value}</h4>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mt-1">{s.label}</p>

              {/* Background decoration */}
              <div className={`absolute -right-3 -bottom-3 w-14 h-14 rounded-full opacity-[0.06] ${s.accentColor}`}></div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CHARTS SECTION                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ─── Bar Chart: Peserta per Pelatihan (3/5) ─── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
          {/* Chart Header */}
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Peserta per Pelatihan</h3>
                <p className="text-xs text-stone-400">Distribusi peserta di setiap program</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
              <Users className="w-3.5 h-3.5" />
              <span className="font-medium">{statsResponse.total_peserta} Total</span>
            </div>
          </div>

          {/* Chart Body */}
          <div className="p-6 flex-1">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart layout="vertical" data={data.grafik.peserta_per_pelatihan} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis dataKey="nama_pelatihan" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} width={120} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      padding: '8px 14px',
                      fontSize: '13px'
                    }}
                  />
                  <Bar dataKey="peserta" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={22} animationDuration={1200}>
                    {(data.grafik.peserta_per_pelatihan || []).map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── Pie Chart: Tingkat Kelulusan (2/5) ─── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
          {/* Chart Header */}
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <PieChartIcon className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Tingkat Kelulusan</h3>
                <p className="text-xs text-stone-400">Evaluasi keberhasilan</p>
              </div>
            </div>
          </div>

          {/* Chart Body */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Summary badges */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                <p className="text-lg font-bold text-emerald-700">{totalLulus}</p>
                <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Lulus</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 text-center border border-red-100">
                <p className="text-lg font-bold text-red-600">{totalTidakLulus}</p>
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Tidak Lulus</p>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="h-64 flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={kelulusanData}
                    cx="50%" cy="45%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                    stroke="none"
                  >
                    {kelulusanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      padding: '8px 14px',
                      fontSize: '13px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Percentage center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: '30px' }}>
                <div className="text-center">
                  <span className="block text-3xl font-bold text-stone-800">{tingkatKelulusan}%</span>
                  <span className="block text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Kelulusan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* RECENT PELATIHAN TABLE                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {dataPelatihan.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Daftar Pelatihan</h3>
                <p className="text-xs text-stone-400">Program pelatihan terdaftar</p>
              </div>
            </div>
            <span className="text-xs text-stone-400 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
              {dataPelatihan.length} program
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Nama Pelatihan</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Peserta</th>
                </tr>
              </thead>
              <tbody>
                {dataPelatihan.slice(0, 5).map((p, idx) => {
                  const jumlahPeserta = dataPeserta.filter(ps => ps.pelatihan_id === p.id).length;
                  return (
                    <tr key={p.id || idx} className="border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="font-medium text-stone-800 truncate max-w-[240px]">{p.nama_pelatihan}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'aktif' ? 'bg-emerald-500' : 'bg-stone-400'
                          }`} />
                          {p.status === 'aktif' ? 'Aktif' : 'Selesai'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          {jumlahPeserta}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {dataPelatihan.length > 5 && (
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/30 text-center">
              <a href="/lpk/pelatihan" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1">
                Lihat semua pelatihan <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
