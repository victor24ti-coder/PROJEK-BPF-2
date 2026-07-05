import { useState, useEffect, useCallback } from "react";
import {
  FileText, Download, Filter, Search, RotateCcw,
  BarChart2, Users, Award, BookOpen, FileSpreadsheet,
  Calendar, Loader2, AlertTriangle, Printer, TrendingUp, CheckCircle, ShieldCheck
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_PELATIHAN = {
  dibuka:  { label: "Dibuka",  dot: "bg-blue-500",    cls: "bg-blue-50 text-blue-700 border-blue-200" },
  aktif:   { label: "Aktif",   dot: "bg-amber-500",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  selesai: { label: "Selesai", dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ditutup: { label: "Ditutup", dot: "bg-stone-400",   cls: "bg-stone-100 text-stone-600 border-stone-200" },
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const TABS = [
  { id: "pelatihan",   label: "Pelatihan",   icon: BookOpen },
  { id: "peserta",     label: "Peserta",     icon: Users },
  { id: "sertifikasi", label: "Sertifikasi", icon: Award },
  { id: "statistik",   label: "Statistik",   icon: BarChart2 },
];

export default function LaporanIndex() {
  const [data, setData] = useState({
    stats: { total_pelatihan: 0, total_peserta: 0, total_sertifikat: 0, total_lulus: 0 },
    data_pelatihan: [],
    data_peserta: [],
    data_sertifikasi: [],
    grafik: { peserta_per_pelatihan: [], tingkat_kelulusan: [], sertifikat_per_bulan: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [startDate,       setStartDate]       = useState("");
  const [endDate,         setEndDate]         = useState("");
  const [filterPelatihan, setFilterPelatihan] = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [pelatihans,      setPelatihans]      = useState([]);
  const [activeTab,       setActiveTab]       = useState("pelatihan");

  useEffect(() => {
    lpkPortalAPI.pelatihan.getAll().then(r => setPelatihans(r.data.data ?? [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate)       params.append("start_date",   startDate);
      if (endDate)         params.append("end_date",     endDate);
      if (filterPelatihan) params.append("pelatihan_id", filterPelatihan);
      if (filterStatus)    params.append("status",       filterStatus);
      const res = await lpkPortalAPI.laporan.getDashboard(params.toString());
      setData(res.data);
    } catch {
      setError("Gagal memuat data laporan. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterPelatihan, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReset = () => { setStartDate(""); setEndDate(""); setFilterPelatihan(""); setFilterStatus(""); };

  // --- EXPORT PDF ---
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Laporan Aktivitas Pelatihan LPK", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periode: ${startDate || "Semua Waktu"} s/d ${endDate || "Semua Waktu"}`, 14, 28);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 33);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Ringkasan Statistik", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [["Total Pelatihan", "Total Peserta", "Total Lulus", "Total Sertifikat"]],
      body: [[data.stats.total_pelatihan, data.stats.total_peserta, data.stats.total_lulus, data.stats.total_sertifikat]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    let finalY = (doc.lastAutoTable?.finalY || 50) + 15;
    
    if (activeTab === "pelatihan" || activeTab === "statistik") {
      doc.text("Laporan Pelatihan", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["No", "Nama Pelatihan", "Jenis", "Kuota", "Peserta", "Lulus", "Status"]],
        body: data.data_pelatihan.map((p, i) => [i + 1, p.nama_pelatihan, p.jenis_pelatihan, p.kuota, p.jumlah_peserta, p.jumlah_lulus, p.status]),
        theme: "striped",
        headStyles: { fillColor: [52, 211, 153] }
      });
      finalY = (doc.lastAutoTable?.finalY || finalY) + 15;
    }
    
    if (activeTab === "peserta" || activeTab === "statistik") {
      if (finalY > 170) { doc.addPage(); finalY = 20; }
      doc.text("Laporan Peserta Pelatihan", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["No", "Nama Peserta", "NIK", "Pelatihan", "Nilai", "Status"]],
        body: data.data_peserta.map((p, i) => [i + 1, p.tenaga_kerja?.nama || "-", p.tenaga_kerja?.nik || "-", p.pelatihan?.nama_pelatihan || "-", p.nilai ?? "-", p.status_peserta]),
        theme: "striped",
        headStyles: { fillColor: [245, 158, 11] }
      });
      finalY = (doc.lastAutoTable?.finalY || finalY) + 15;
    }
    
    if (activeTab === "sertifikasi" || activeTab === "statistik") {
      if (finalY > 170) { doc.addPage(); finalY = 20; }
      doc.text("Laporan Sertifikasi", 14, finalY);
      autoTable(doc, {
        startY: finalY + 5,
        head: [["No", "Nama Peserta", "Pelatihan", "No Sertifikat", "Tanggal Terbit", "Status"]],
        body: data.data_sertifikasi.map((s, i) => [i + 1, s.peserta_pelatihan?.tenaga_kerja?.nama || "-", s.peserta_pelatihan?.pelatihan?.nama_pelatihan || "-", s.nomor_sertifikat, new Date(s.tanggal_terbit).toLocaleDateString("id-ID"), s.status_sertifikat]),
        theme: "striped",
        headStyles: { fillColor: [139, 92, 246] }
      });
    }
    doc.save("Laporan_Pelatihan_LPK.pdf");
  };

  // --- EXPORT EXCEL ---
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.data_pelatihan.map((p, i) => ({ No: i + 1, "Nama Pelatihan": p.nama_pelatihan, Jenis: p.jenis_pelatihan, Kuota: p.kuota, Peserta: p.jumlah_peserta, Lulus: p.jumlah_lulus, Status: p.status }))), "Pelatihan");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.data_peserta.map((p, i) => ({ No: i + 1, Nama: p.tenaga_kerja?.nama, NIK: p.tenaga_kerja?.nik, Pelatihan: p.pelatihan?.nama_pelatihan, Nilai: p.nilai, Status: p.status_peserta }))), "Peserta");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.data_sertifikasi.map((s, i) => ({ No: i + 1, Nama: s.peserta_pelatihan?.tenaga_kerja?.nama, Pelatihan: s.peserta_pelatihan?.pelatihan?.nama_pelatihan, "Nomor Sertifikat": s.nomor_sertifikat, "Tanggal Terbit": s.tanggal_terbit, Status: s.status_sertifikat }))), "Sertifikasi");
    XLSX.writeFile(wb, "Laporan_Aktivitas_LPK.xlsx");
  };

  const formatTgl = (tgl) => tgl ? new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";



  const statCards = [
    { label: "Total Pelatihan",  value: data.stats.total_pelatihan,  icon: BookOpen,  bg: "bg-blue-50",    ic: "text-blue-600",    accent: "bg-blue-500" },
    { label: "Total Peserta",    value: data.stats.total_peserta,    icon: Users,     bg: "bg-emerald-50", ic: "text-emerald-600", accent: "bg-emerald-500" },
    { label: "Total Lulus",      value: data.stats.total_lulus,      icon: TrendingUp,bg: "bg-amber-50",   ic: "text-amber-600",   accent: "bg-amber-500" },
    { label: "Total Sertifikat", value: data.stats.total_sertifikat, icon: FileText,  bg: "bg-purple-50",  ic: "text-purple-600",  accent: "bg-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PAGE HEADER                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Laporan</h1>
              <p className="text-sm text-stone-400 mt-0.5">Kelola dan cetak laporan seluruh kegiatan pelatihan LPK.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition"
            >
              <Printer size={15} /> Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition"
            >
              <FileSpreadsheet size={15} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FILTER PANEL                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Filter className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Filter Laporan</h2>
            <p className="text-xs text-stone-400">Saring data berdasarkan periode, pelatihan, atau status</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />Tanggal Awal
              </label>
              <input
                type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />Tanggal Akhir
              </label>
              <input
                type="date" value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Pilih Pelatihan</label>
              <select
                value={filterPelatihan} onChange={e => setFilterPelatihan(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">Semua Pelatihan</option>
                {pelatihans.map(p => <option key={p.id} value={p.id}>{p.nama_pelatihan}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Status Pelatihan</label>
              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">Semua Status</option>
                <option value="dibuka">Dibuka</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="ditutup">Ditutup</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-stone-100">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition"
            >
              <RotateCcw size={13} /> Reset
            </button>
            <button
              onClick={fetchData} disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              Cari Data
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAT CARDS                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all duration-200">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${s.ic}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-900">{s.value}</p>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mt-1">{s.label}</p>
              <div className={`absolute -right-3 -bottom-3 w-14 h-14 rounded-full opacity-[0.06] ${s.accent}`} />
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TAB PANEL                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-stone-100 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-medium border-b-2 transition whitespace-nowrap min-w-max ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-blue-50/40"
                    : "border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50/50"
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[380px]">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-sm rounded-b-xl">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                <p className="text-xs text-stone-500 font-medium">Memuat data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="m-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ─── TAB: PELATIHAN ─── */}
          {activeTab === "pelatihan" && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {["No", "Nama Pelatihan", "Jenis", "Kuota", "Peserta", "Lulus", "Status"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {data.data_pelatihan.length > 0 ? data.data_pelatihan.map((item, idx) => {
                    const st = STATUS_PELATIHAN[item.status] || { label: item.status, dot: "bg-gray-400", cls: "bg-gray-100 text-gray-600 border-gray-200" };
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-5 py-4 text-sm text-stone-400">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">{item.nama_pelatihan}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-stone-500 capitalize">{item.jenis_pelatihan}</td>
                        <td className="px-5 py-4 text-sm font-medium text-stone-600">{item.kuota}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600">
                            <Users className="w-3.5 h-3.5 text-stone-400" /> {item.jumlah_peserta}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                            <CheckCircle className="w-3.5 h-3.5" /> {item.jumlah_lulus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : <EmptyRow cols={7} msg="Tidak ada data pelatihan." />}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── TAB: PESERTA ─── */}
          {activeTab === "peserta" && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {["No", "Nama Peserta", "NIK", "Pelatihan", "Nilai", "Status Kelulusan"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {data.data_peserta.length > 0 ? data.data_peserta.map((item, idx) => {
                    const isLulus = item.status_peserta === "lulus";
                    const isTidak = item.status_peserta === "tidak_lulus";
                    const stCls = isLulus ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isTidak ? "bg-red-50 text-red-700 border-red-200" : "bg-stone-100 text-stone-600 border-stone-200";
                    const stDot = isLulus ? "bg-emerald-500" : isTidak ? "bg-red-500" : "bg-stone-400";
                    const stLabel = isLulus ? "Lulus" : isTidak ? "Tidak Lulus" : "Aktif";
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-5 py-4 text-sm text-stone-400">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold ring-1 ring-blue-200 flex-shrink-0">
                              {(item.tenaga_kerja?.nama || "?")[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">{item.tenaga_kerja?.nama || "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-mono text-stone-500">{item.tenaga_kerja?.nik || "—"}</td>
                        <td className="px-5 py-4 text-sm text-stone-600 max-w-[200px] truncate">{item.pelatihan?.nama_pelatihan || "—"}</td>
                        <td className="px-5 py-4 text-sm font-bold text-stone-800">{item.nilai ?? <span className="text-stone-300 font-normal">—</span>}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stCls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stDot}`} />{stLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : <EmptyRow cols={6} msg="Tidak ada data peserta." />}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── TAB: SERTIFIKASI ─── */}
          {activeTab === "sertifikasi" && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {["No", "Nama Peserta", "Pelatihan", "Nomor Sertifikat", "Tanggal Terbit", "Status", "File"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {data.data_sertifikasi.length > 0 ? data.data_sertifikasi.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-5 py-4 text-sm text-stone-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold ring-1 ring-purple-200 flex-shrink-0">
                            {(item.peserta_pelatihan?.tenaga_kerja?.nama || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">{item.peserta_pelatihan?.tenaga_kerja?.nama || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-600 max-w-[180px] truncate">{item.peserta_pelatihan?.pelatihan?.nama_pelatihan || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-xs font-mono font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">{item.nomor_sertifikat}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-stone-600">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />{formatTgl(item.tanggal_terbit)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.status_sertifikat === "aktif" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status_sertifikat === "aktif" ? "bg-emerald-500" : "bg-red-500"}`} />
                          {item.status_sertifikat === "aktif" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {item.file_sertifikat ? (
                          <a href={`${BACKEND}${item.file_sertifikat}`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                            <Download size={12} /> PDF
                          </a>
                        ) : (
                          <span className="text-xs text-stone-300 italic">—</span>
                        )}
                      </td>
                    </tr>
                  )) : <EmptyRow cols={7} msg="Tidak ada data sertifikasi." />}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── TAB: STATISTIK ─── */}
          {activeTab === "statistik" && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Bar Chart - Peserta per Pelatihan */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800">Peserta per Pelatihan</h3>
                    <p className="text-xs text-stone-400">Distribusi jumlah peserta</p>
                  </div>
                </div>
                <div className="p-5 h-72">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={data.grafik.peserta_per_pelatihan} margin={{ top: 5, right: 10, left: -20, bottom: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="nama_pelatihan" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} angle={-25} textAnchor="end" interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)", fontSize: "13px" }} />
                      <Bar dataKey="peserta" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Kelulusan */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800">Tingkat Kelulusan</h3>
                    <p className="text-xs text-stone-400">Persentase lulus vs tidak lulus</p>
                  </div>
                </div>
                <div className="p-5 h-72">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie data={data.grafik.tingkat_kelulusan} cx="50%" cy="45%" innerRadius={60} outerRadius={88} paddingAngle={5} dataKey="value" stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}>
                        {data.grafik.tingkat_kelulusan.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)", fontSize: "13px" }} />
                      <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart - Sertifikat per Bulan */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden lg:col-span-2">
                <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800">Sertifikat Diterbitkan (Bulanan)</h3>
                    <p className="text-xs text-stone-400">Tren penerbitan sertifikat per bulan</p>
                  </div>
                </div>
                <div className="p-5 h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={data.grafik.sertifikat_per_bulan} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)", fontSize: "13px" }} />
                      <Line type="monotone" dataKey="jumlah" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#8b5cf6" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// Helper component
function EmptyRow({ cols, msg }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center py-14">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-sm text-stone-500">{msg}</p>
        </div>
      </td>
    </tr>
  );
}