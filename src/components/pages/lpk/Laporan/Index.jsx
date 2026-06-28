import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FileText, Download, Filter, Search, RotateCcw, 
  BarChart2, Users, Award, BookOpen, FileSpreadsheet,
  Calendar, Eye, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Printer
} from "lucide-react";
import { laporanAPI, pelatihanAPI } from "../../../../services/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_MAP = {
  dibuka:  { label: "Dibuka",  cls: "bg-blue-50 text-blue-700 border-blue-100" },
  aktif:   { label: "Aktif",   cls: "bg-amber-50 text-amber-700 border-amber-100" },
  selesai: { label: "Selesai", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ditutup: { label: "Ditutup", cls: "bg-stone-50 text-stone-700 border-stone-200" },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function LaporanIndex() {
  const [data, setData] = useState({
    stats: { total_pelatihan: 0, total_peserta: 0, total_sertifikat: 0, total_lulus: 0 },
    data_pelatihan: [],
    data_peserta: [],
    data_sertifikasi: [],
    grafik: { peserta_per_pelatihan: [], tingkat_kelulusan: [], sertifikat_per_bulan: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterPelatihan, setFilterPelatihan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [pelatihans, setPelatihans] = useState([]);
  
  // Tab states
  const [activeTab, setActiveTab] = useState("pelatihan"); // pelatihan, peserta, sertifikasi, statistik

  // Fetch Pelatihan for filter dropdown
  useEffect(() => {
    pelatihanAPI.getAll().then(r => setPelatihans(r.data.data ?? [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (filterPelatihan) params.append("pelatihan_id", filterPelatihan);
      if (filterStatus) params.append("status", filterStatus);

      const res = await laporanAPI.getDashboard(params.toString());
      setData(res.data);
    } catch {
      setError("Gagal memuat data laporan. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterPelatihan, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setFilterPelatihan("");
    setFilterStatus("");
  };

  // --- EXPORT PDF ---
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFont("helvetica");

    // Header
    doc.setFontSize(18);
    doc.text("Laporan Aktivitas Pelatihan LPK", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periode: ${startDate || "Semua Waktu"} s/d ${endDate || "Semua Waktu"}`, 14, 28);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 33);
    
    // Ringkasan Statistik
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Ringkasan Statistik", 14, 45);
    
    doc.autoTable({
      startY: 50,
      head: [["Total Pelatihan", "Total Peserta", "Total Lulus", "Total Sertifikat"]],
      body: [[
        data.stats.total_pelatihan, 
        data.stats.total_peserta, 
        data.stats.total_lulus, 
        data.stats.total_sertifikat
      ]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    // Tabel Pelatihan
    if (activeTab === "pelatihan" || activeTab === "statistik") {
      doc.text("Laporan Pelatihan", 14, finalY);
      doc.autoTable({
        startY: finalY + 5,
        head: [["No", "Nama Pelatihan", "Jenis", "Kuota", "Peserta", "Lulus", "Status"]],
        body: data.data_pelatihan.map((p, i) => [
          i + 1, p.nama_pelatihan, p.jenis_pelatihan, p.kuota, p.jumlah_peserta, p.jumlah_lulus, p.status
        ]),
        theme: 'striped',
        headStyles: { fillColor: [52, 211, 153] }
      });
      finalY = doc.lastAutoTable.finalY + 15;
    }

    // Tabel Peserta
    if (activeTab === "peserta" || activeTab === "statistik") {
      if (finalY > 170) { doc.addPage(); finalY = 20; }
      doc.text("Laporan Peserta Pelatihan", 14, finalY);
      doc.autoTable({
        startY: finalY + 5,
        head: [["No", "Nama Peserta", "NIK", "Pelatihan", "Nilai", "Status"]],
        body: data.data_peserta.map((p, i) => [
          i + 1, p.tenaga_kerja?.nama || "-", p.tenaga_kerja?.nik || "-", 
          p.pelatihan?.nama_pelatihan || "-", p.nilai ?? "-", p.status_peserta
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }
      });
      finalY = doc.lastAutoTable.finalY + 15;
    }

    // Tabel Sertifikasi
    if (activeTab === "sertifikasi" || activeTab === "statistik") {
      if (finalY > 170) { doc.addPage(); finalY = 20; }
      doc.text("Laporan Sertifikasi", 14, finalY);
      doc.autoTable({
        startY: finalY + 5,
        head: [["No", "Nama Peserta", "Pelatihan", "No Sertifikat", "Tanggal Terbit", "Status"]],
        body: data.data_sertifikasi.map((s, i) => [
          i + 1, s.peserta_pelatihan?.tenaga_kerja?.nama || "-", 
          s.peserta_pelatihan?.pelatihan?.nama_pelatihan || "-", 
          s.nomor_sertifikat, new Date(s.tanggal_terbit).toLocaleDateString('id-ID'), 
          s.status_sertifikat
        ]),
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
      });
    }

    doc.save("Laporan_Pelatihan_LPK.pdf");
  };

  // --- EXPORT EXCEL ---
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet Pelatihan
    const wsPelatihan = XLSX.utils.json_to_sheet(data.data_pelatihan.map((p, i) => ({
      No: i + 1,
      "Nama Pelatihan": p.nama_pelatihan,
      Jenis: p.jenis_pelatihan,
      Kuota: p.kuota,
      Peserta: p.jumlah_peserta,
      Lulus: p.jumlah_lulus,
      Status: p.status
    })));
    XLSX.utils.book_append_sheet(wb, wsPelatihan, "Pelatihan");

    // Sheet Peserta
    const wsPeserta = XLSX.utils.json_to_sheet(data.data_peserta.map((p, i) => ({
      No: i + 1,
      Nama: p.tenaga_kerja?.nama,
      NIK: p.tenaga_kerja?.nik,
      Pelatihan: p.pelatihan?.nama_pelatihan,
      Nilai: p.nilai,
      Status: p.status_peserta
    })));
    XLSX.utils.book_append_sheet(wb, wsPeserta, "Peserta");

    // Sheet Sertifikasi
    const wsSertifikasi = XLSX.utils.json_to_sheet(data.data_sertifikasi.map((s, i) => ({
      No: i + 1,
      Nama: s.peserta_pelatihan?.tenaga_kerja?.nama,
      Pelatihan: s.peserta_pelatihan?.pelatihan?.nama_pelatihan,
      "Nomor Sertifikat": s.nomor_sertifikat,
      "Tanggal Terbit": s.tanggal_terbit,
      Status: s.status_sertifikat
    })));
    XLSX.utils.book_append_sheet(wb, wsSertifikasi, "Sertifikasi");

    XLSX.writeFile(wb, "Laporan_Aktivitas_LPK.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-850 tracking-tight">Laporan</h1>
          <p className="text-stone-500 mt-1">Kelola dan cetak laporan seluruh kegiatan pelatihan LPK.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition text-sm">
            <Printer size={16} /> Export PDF
          </button>
          <button onClick={exportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition text-sm">
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* 2. Filter Laporan */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={16} className="text-stone-400" /> Filter Laporan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Tanggal Awal</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Tanggal Akhir</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Pilih Pelatihan</label>
            <select value={filterPelatihan} onChange={e => setFilterPelatihan(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
              <option value="">Semua Pelatihan</option>
              {pelatihans.map(p => <option key={p.id} value={p.id}>{p.nama_pelatihan}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Status Pelatihan</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white">
              <option value="">Semua Status</option>
              <option value="dibuka">Dibuka</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="ditutup">Ditutup</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleReset} className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition flex items-center gap-2">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={fetchData} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Cari Data
          </button>
        </div>
      </div>

      {/* 3. Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pelatihan",  val: data.stats.total_pelatihan,  icon: <BookOpen size={22} />, bg: "bg-blue-50 text-blue-600 border-blue-100" },
          { label: "Total Peserta",    val: data.stats.total_peserta,    icon: <Users size={22} />,    bg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { label: "Total Lulus",      val: data.stats.total_lulus,      icon: <Award size={22} />,    bg: "bg-amber-50 text-amber-600 border-amber-100" },
          { label: "Total Sertifikat", val: data.stats.total_sertifikat, icon: <FileText size={22} />, bg: "bg-purple-50 text-purple-600 border-purple-100" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl p-5 flex items-center gap-4 ${s.bg}`}>
            <div className="p-3 bg-white/60 rounded-xl shadow-sm">{s.icon}</div>
            <div>
              <p className="text-sm font-semibold opacity-80 uppercase tracking-wider">{s.label}</p>
              <h4 className="text-2xl font-bold mt-0.5">{s.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Tab Navigasi */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex border-b border-stone-200 overflow-x-auto hide-scrollbar">
          {[
            { id: "pelatihan",   label: "Pelatihan",   icon: <BookOpen size={16} /> },
            { id: "peserta",     label: "Peserta",     icon: <Users size={16} /> },
            { id: "sertifikasi", label: "Sertifikasi", icon: <Award size={16} /> },
            { id: "statistik",   label: "Statistik",   icon: <BarChart2 size={16} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap
                ${activeTab === t.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-50"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Loading Overlay untuk Konten Tab */}
        <div className="relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <div className="p-0">
            {/* TAB PELATIHAN */}
            {activeTab === "pelatihan" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      {["No", "Nama Pelatihan", "Jenis", "Kuota", "Peserta", "Lulus", "Status"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-150">
                    {data.data_pelatihan.length > 0 ? data.data_pelatihan.map((item, idx) => {
                      const st = STATUS_MAP[item.status] || { label: item.status, cls: "bg-gray-100 text-gray-700 border-gray-200" };
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/50 transition">
                          <td className="px-5 py-4 text-sm text-stone-500">{idx + 1}.</td>
                          <td className="px-5 py-4 font-medium text-stone-850">{item.nama_pelatihan}</td>
                          <td className="px-5 py-4 text-sm text-stone-600 capitalize">{item.jenis_pelatihan}</td>
                          <td className="px-5 py-4 text-sm text-stone-600">{item.kuota}</td>
                          <td className="px-5 py-4 text-sm text-stone-600">{item.jumlah_peserta}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-emerald-600">{item.jumlah_lulus}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="7" className="text-center py-10 text-stone-500 text-sm">Tidak ada data pelatihan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB PESERTA */}
            {activeTab === "peserta" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      {["No", "Nama Peserta", "NIK", "Pelatihan", "Nilai", "Status Kelulusan"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-150">
                    {data.data_peserta.length > 0 ? data.data_peserta.map((item, idx) => {
                      const st = item.status_peserta === 'lulus' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                 item.status_peserta === 'tidak_lulus' ? "bg-red-50 text-red-700 border-red-200" : "bg-stone-100 text-stone-700 border-stone-200";
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/50 transition">
                          <td className="px-5 py-4 text-sm text-stone-500">{idx + 1}.</td>
                          <td className="px-5 py-4 font-medium text-stone-850">{item.tenaga_kerja?.nama || "—"}</td>
                          <td className="px-5 py-4 text-sm font-mono text-stone-600">{item.tenaga_kerja?.nik || "—"}</td>
                          <td className="px-5 py-4 text-sm text-stone-700">{item.pelatihan?.nama_pelatihan || "—"}</td>
                          <td className="px-5 py-4 text-sm font-semibold">{item.nilai ?? "—"}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${st}`}>
                              {item.status_peserta.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="6" className="text-center py-10 text-stone-500 text-sm">Tidak ada data peserta.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB SERTIFIKASI */}
            {activeTab === "sertifikasi" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      {["No", "Nama Peserta", "Pelatihan", "No Sertifikat", "Tanggal Terbit", "Status", "Aksi"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-150">
                    {data.data_sertifikasi.length > 0 ? data.data_sertifikasi.map((item, idx) => {
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/50 transition">
                          <td className="px-5 py-4 text-sm text-stone-500">{idx + 1}.</td>
                          <td className="px-5 py-4 font-medium text-stone-850">{item.peserta_pelatihan?.tenaga_kerja?.nama || "—"}</td>
                          <td className="px-5 py-4 text-sm text-stone-700">{item.peserta_pelatihan?.pelatihan?.nama_pelatihan || "—"}</td>
                          <td className="px-5 py-4 text-sm font-mono font-semibold text-stone-800">{item.nomor_sertifikat}</td>
                          <td className="px-5 py-4 text-sm text-stone-600">{new Date(item.tanggal_terbit).toLocaleDateString('id-ID')}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${item.status_sertifikat === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {item.status_sertifikat === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {item.file_sertifikat ? (
                              <a href={`${BACKEND}${item.file_sertifikat}`} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-200 font-medium transition whitespace-nowrap w-fit">
                                <Download size={14} /> PDF
                              </a>
                            ) : (
                              <span className="text-xs text-stone-400 italic">Tidak ada file</span>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan="7" className="text-center py-10 text-stone-500 text-sm">Tidak ada data sertifikasi.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB STATISTIK */}
            {activeTab === "statistik" && (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-stone-50/30">
                
                {/* Grafik Peserta */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <h3 className="font-semibold text-stone-850 mb-6 flex items-center gap-2"><Users size={18} className="text-blue-500"/> Jumlah Peserta per Pelatihan</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={data.grafik.peserta_per_pelatihan} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="nama_pelatihan" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} interval={0} angle={-30} textAnchor="end" />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="peserta" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grafik Kelulusan */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                  <h3 className="font-semibold text-stone-850 mb-6 flex items-center gap-2"><Award size={18} className="text-emerald-500"/> Tingkat Kelulusan</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie data={data.grafik.tingkat_kelulusan} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {data.grafik.tingkat_kelulusan.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grafik Sertifikat per Bulan */}
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm lg:col-span-2">
                  <h3 className="font-semibold text-stone-850 mb-6 flex items-center gap-2"><FileText size={18} className="text-purple-500"/> Sertifikat Diterbitkan (Bulanan)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <LineChart data={data.grafik.sertifikat_per_bulan} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="jumlah" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}