import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { laporanAPI } from "../../../services/api";
import {
  BookOpen, Activity, Users, UserCheck, Award, TrendingUp, Calendar, Clock, Loader2, AlertTriangle
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
    laporanAPI.getDashboard()
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
    { label: "Total Pelatihan",   value: statsResponse.total_pelatihan,  icon: BookOpen,   color: "bg-blue-50 text-blue-600" },
    { label: "Pelatihan Aktif",   value: pelatihanAktif,                 icon: Activity,   color: "bg-indigo-50 text-indigo-600" },
    { label: "Total Peserta",     value: statsResponse.total_peserta,    icon: Users,      color: "bg-emerald-50 text-emerald-600" },
    { label: "Peserta Aktif",     value: pesertaAktif,                   icon: UserCheck,  color: "bg-teal-50 text-teal-600" },
    { label: "Sertifikat Terbit", value: statsResponse.total_sertifikat, icon: Award,      color: "bg-purple-50 text-purple-600" },
    { label: "Tingkat Kelulusan", value: `${tingkatKelulusan}%`,         icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
  ];

  const kelulusanData = [
    { name: 'Lulus', value: totalLulus },
    { name: 'Tidak Lulus', value: totalTidakLulus },
  ];

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeInUp 0.5s ease-out forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}} />

      {/* 1. Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 animate-fade-in opacity-0">
        <div>
          <h1 className="text-sm font-semibold tracking-wider text-blue-200 uppercase mb-1">Dashboard LPK</h1>
          <h2 className="text-3xl font-bold mb-2">Selamat Datang, {user?.name || "LPK"} 👋</h2>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl">
            Kelola seluruh aktivitas pelatihan melalui dashboard interaktif ini.
          </p>
        </div>
        <div className="flex gap-4 md:gap-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-inner min-w-max">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Calendar className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-blue-200 uppercase font-semibold">Tanggal</p>
              <p className="text-sm font-bold">{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-blue-200 uppercase font-semibold">Jam</p>
              <p className="text-sm font-bold font-mono tracking-wider">{currentTime.toLocaleTimeString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ringkasan Statistik (Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 animate-fade-in delay-100 opacity-0">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${s.color} transition-transform group-hover:scale-110`}>
                  <Icon size={20} />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-stone-800 tracking-tight">{s.value}</h4>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mt-1">{s.label}</p>
              <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 ${s.color.split(' ')[0]}`}></div>
            </div>
          );
        })}
      </div>

      {/* 3 & 4. Grafik Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in delay-200 opacity-0">
        
        {/* Grafik Pelatihan */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 xl:col-span-2 flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-stone-800 text-lg">Statistik Peserta per Pelatihan</h3>
              <p className="text-sm text-stone-500">Melihat pelatihan mana yang paling banyak diminati.</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <div className="h-80 flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart layout="vertical" data={data.grafik.peserta_per_pelatihan} margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="nama_pelatihan" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }} width={120} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="peserta" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Kelulusan */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-stone-800 text-lg">Tingkat Kelulusan</h3>
              <p className="text-sm text-stone-500">Evaluasi keberhasilan pelatihan.</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award size={18} />
            </div>
          </div>
          <div className="h-80 flex-1 w-full flex flex-col justify-center relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie 
                  data={kelulusanData} 
                  cx="50%" cy="45%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  animationDuration={1500}
                >
                  {kelulusanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Persentase di tengah donut */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-10">
              <div className="text-center">
                <span className="block text-3xl font-bold text-stone-800">{tingkatKelulusan}%</span>
                <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Lulus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
