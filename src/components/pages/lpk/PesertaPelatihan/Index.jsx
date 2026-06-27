import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Loader2, AlertTriangle, Users, GraduationCap,
  Edit2, Trash2, Eye, Award, ChevronLeft, ChevronRight, Filter,
  Download, Upload, History
} from "lucide-react";
import * as XLSX from "xlsx";
import { pesertaPelatihanAPI, pelatihanAPI } from "../../../../services/api";
import ImportModal from "./ImportModal";
import HistoryModal from "./HistoryModal";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_MAP = {
  aktif:       { label: "Aktif",       cls: "bg-blue-50 text-blue-700 border-blue-100" },
  lulus:       { label: "Lulus",       cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  tidak_lulus: { label: "Tidak Lulus", cls: "bg-red-50 text-red-700 border-red-100" },
};

export default function Index() {
  const [data,     setData]     = useState([]);
  const [meta,     setMeta]     = useState({ current_page: 1, last_page: 1, total: 0 });
  const [pelatihans, setPelatihans] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [filterPelatihan, setFilterPelatihan] = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [page,     setPage]     = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleDownloadTemplate = () => {
    const wsData = [
      ["NIK", "Nilai", "Status"],
      ["1471081203010001", "90", "Aktif"],
      ["1471081203010002", "85", "Aktif"],
      ["1471081203010003", "78", "Aktif"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_import_peserta.xlsx");
  };

  const fetchData = async (pg = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pg,
        ...(search           && { search }),
        ...(filterPelatihan  && { pelatihan_id: filterPelatihan }),
        ...(filterStatus     && { status_peserta: filterStatus }),
      });
      const res = await pesertaPelatihanAPI.getAll(params.toString());
      const payload = res.data.data;
      setData(payload.data ?? []);
      setMeta({ current_page: payload.current_page, last_page: payload.last_page, total: payload.total });
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data peserta pelatihan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPelatihans = async () => {
    try {
      const res = await pelatihanAPI.getAll();
      setPelatihans(res.data.data ?? []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchPelatihans(); }, []);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterPelatihan, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await pesertaPelatihanAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchData(page);
    } catch {
      alert("Gagal menghapus data.");
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total:       meta.total,
    lulus:       data.filter(d => d.status_peserta === "lulus").length,
    aktif:       data.filter(d => d.status_peserta === "aktif").length,
    tidak_lulus: data.filter(d => d.status_peserta === "tidak_lulus").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-850 tracking-tight">Peserta Pelatihan</h1>
          <p className="text-stone-500 mt-1">Kelola data, nilai, dan status kelulusan peserta program pelatihan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/lpk/peserta-pelatihan/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all text-sm"
          >
            <Plus size={16} />
            Daftarkan Peserta
          </Link>
          <button
            onClick={handleDownloadTemplate}
            className="border border-stone-250 hover:bg-stone-50 text-stone-700 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all text-sm bg-white"
            title="Unduh Template Excel Import"
          >
            <Download size={16} className="text-stone-500" />
            Download Template
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="border border-emerald-200 hover:bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all text-sm bg-white"
            title="Import data peserta dari file Excel"
          >
            <Upload size={16} className="text-emerald-600" />
            Import Excel
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="border border-amber-200 hover:bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all text-sm bg-white"
            title="Lihat riwayat import data"
          >
            <History size={16} className="text-amber-600" />
            Riwayat Import
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Peserta",   val: meta.total, icon: <Users className="w-5 h-5" />,          bg: "bg-blue-50   text-blue-600"   },
          { label: "Kelas Aktif",     val: stats.aktif, icon: <Award className="w-5 h-5" />,          bg: "bg-emerald-50 text-emerald-600" },
          { label: "Lulus",           val: stats.lulus, icon: <GraduationCap className="w-5 h-5" />, bg: "bg-purple-50  text-purple-600"  },
          { label: "Tidak Lulus",     val: stats.tidak_lulus, icon: <AlertTriangle className="w-5 h-5" />, bg: "bg-red-50 text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">{s.label}</p>
              <h4 className="text-xl font-bold text-stone-850 mt-0.5">{s.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-stone-150 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIK peserta..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </form>

          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg px-2 py-1.5 bg-stone-50">
              <Filter className="w-4 h-4 text-stone-400" />
              <select
                value={filterPelatihan}
                onChange={(e) => { setFilterPelatihan(e.target.value); setPage(1); }}
                className="text-sm bg-transparent outline-none text-stone-700"
              >
                <option value="">Semua Pelatihan</option>
                {pelatihans.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_pelatihan}</option>
                ))}
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-stone-50 outline-none text-stone-700 focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="tidak_lulus">Tidak Lulus</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="m-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                {["#", "Peserta", "Program Pelatihan", "Nilai", "Status", "Sertifikat", "Aksi"].map(h => (
                  <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-150">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-stone-200 rounded w-full"></div></td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  const st = STATUS_MAP[item.status_peserta] ?? { label: item.status_peserta, cls: "bg-gray-100 text-gray-700" };
                  const rank = item.nilai >= 90 ? "A" : item.nilai >= 75 ? "B" : item.nilai >= 60 ? "C" : item.nilai >= 0 ? "D" : "—";
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-stone-500 font-medium">
                        {(meta.current_page - 1) * 10 + idx + 1}.
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.foto ? (
                            <img src={`${BACKEND}${item.foto}`} alt="foto" className="w-9 h-9 rounded-full object-cover border border-stone-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                              {(item.tenaga_kerja?.nama || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-stone-850">{item.tenaga_kerja?.nama ?? "-"}</p>
                            <p className="text-xs text-stone-400">NIK: {item.tenaga_kerja?.nik ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-700">{item.pelatihan?.nama_pelatihan ?? "-"}</td>
                      <td className="px-5 py-4">
                        {item.nilai != null ? (
                          <span className="text-sm font-bold text-stone-850">{item.nilai} <span className="text-xs text-stone-400">({rank})</span></span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Belum dinilai</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {item.sertifikasi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ✓ Terbit
                          </span>
                        ) : item.status_peserta === "lulus" ? (
                          <span className="text-xs text-amber-600 italic">Belum diterbitkan</span>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/lpk/peserta-pelatihan/detail/${item.id}`}
                            className="text-stone-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-stone-100 transition" title="Detail">
                            <Eye size={17} />
                          </Link>
                          <Link to={`/lpk/peserta-pelatihan/edit/${item.id}`}
                            className="text-stone-500 hover:text-amber-600 p-1.5 rounded-lg hover:bg-stone-100 transition" title="Edit / Nilai">
                            <Edit2 size={17} />
                          </Link>
                          <button onClick={() => setDeleteTarget(item)}
                            className="text-stone-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-100 transition" title="Hapus">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-sm text-stone-500">
                    Tidak ada data peserta pelatihan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-stone-150 flex items-center justify-between">
            <p className="text-xs text-stone-500">Halaman {meta.current_page} dari {meta.last_page}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.current_page === 1}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-stone-850 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data peserta <strong>{deleteTarget.tenaga_kerja?.nama}</strong> dari program pelatihan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setDeleteTarget(null)}
                className="border border-stone-300 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 transition text-stone-700 font-medium">
                Batal
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 font-medium flex items-center gap-2">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => fetchData(1)}
        pelatihans={pelatihans}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}