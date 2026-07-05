import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Loader2, AlertTriangle, Users, GraduationCap,
  Edit2, Trash2, Eye, Award, ChevronLeft, ChevronRight, Filter,
  Download, Upload, History, X, UserCheck, XCircle
} from "lucide-react";
import * as XLSX from "xlsx";
import { lpkPortalAPI } from "../../../../services/api";
import ImportModal from "./ImportModal";
import HistoryModal from "./HistoryModal";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_MAP = {
  aktif:       { label: "Aktif",       dot: "bg-blue-500 animate-pulse",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  lulus:       { label: "Lulus",       dot: "bg-emerald-500",              cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  tidak_lulus: { label: "Tidak Lulus", dot: "bg-red-500",                  cls: "bg-red-50 text-red-700 border-red-200" },
};

const GRADE_MAP = {
  A: "text-emerald-600 bg-emerald-50 border-emerald-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-amber-600 bg-amber-50 border-amber-200",
  D: "text-red-600 bg-red-50 border-red-200",
};

export default function Index() {
  const [data,        setData]        = useState([]);
  const [meta,        setMeta]        = useState({ current_page: 1, last_page: 1, total: 0 });
  const [pelatihans,  setPelatihans]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [filterPelatihan, setFilterPelatihan] = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [page,        setPage]        = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [isImportOpen,  setIsImportOpen]  = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleDownloadTemplate = () => {
    const wsData = [
      ["NIK", "Nilai", "Status"],
      ["1471081203010001", "90", "Aktif"],
      ["1471081203010002", "85", "Aktif"],
      ["1471081203010003", "78", "Aktif"],
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
        ...(search          && { search }),
        ...(filterPelatihan && { pelatihan_id: filterPelatihan }),
        ...(filterStatus    && { status_peserta: filterStatus }),
      });
      const res = await lpkPortalAPI.pesertaPelatihan.getAll(params.toString());
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
      const res = await lpkPortalAPI.pelatihan.getAll();
      setPelatihans(res.data.data ?? []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchPelatihans(); }, []);
  useEffect(() => { fetchData(page); }, [page, filterPelatihan, filterStatus]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(1); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await lpkPortalAPI.pesertaPelatihan.delete(deleteTarget.id);
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
    aktif:       data.filter(d => d.status_peserta === "aktif").length,
    lulus:       data.filter(d => d.status_peserta === "lulus").length,
    tidak_lulus: data.filter(d => d.status_peserta === "tidak_lulus").length,
  };

  const statCards = [
    { label: "Total Peserta", value: stats.total,       icon: Users,          bg: "bg-blue-50",    ic: "text-blue-600",    accent: "bg-blue-500" },
    { label: "Sedang Aktif",  value: stats.aktif,       icon: UserCheck,      bg: "bg-sky-50",     ic: "text-sky-600",     accent: "bg-sky-500" },
    { label: "Lulus",         value: stats.lulus,       icon: GraduationCap,  bg: "bg-emerald-50", ic: "text-emerald-600", accent: "bg-emerald-500" },
    { label: "Tidak Lulus",   value: stats.tidak_lulus, icon: XCircle,        bg: "bg-red-50",     ic: "text-red-500",     accent: "bg-red-500" },
  ];

  const getGrade = (nilai) =>
    nilai >= 90 ? "A" : nilai >= 75 ? "B" : nilai >= 60 ? "C" : nilai >= 0 ? "D" : null;

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
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Peserta Pelatihan</h1>
              <p className="text-sm text-stone-400 mt-0.5">Kelola data, nilai, dan status kelulusan peserta program pelatihan.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/lpk/peserta-pelatihan/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition-all text-sm"
            >
              <Plus size={15} /> Daftarkan Peserta
            </Link>
            <button
              onClick={handleDownloadTemplate}
              className="border border-stone-200 hover:bg-stone-50 text-stone-600 px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-1.5 transition text-sm bg-white"
            >
              <Download size={15} className="text-stone-500" /> Template
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="border border-emerald-200 hover:bg-emerald-50 text-emerald-700 px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-1.5 transition text-sm bg-white"
            >
              <Upload size={15} className="text-emerald-600" /> Import Excel
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="border border-amber-200 hover:bg-amber-50 text-amber-700 px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-1.5 transition text-sm bg-white"
            >
              <History size={15} className="text-amber-600" /> Riwayat
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STAT CARDS                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      {/* TABLE CARD                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIK peserta..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-sm text-stone-600">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filterPelatihan}
                onChange={(e) => { setFilterPelatihan(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-sm text-stone-700 max-w-[160px]"
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
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white outline-none text-stone-700 focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="tidak_lulus">Tidak Lulus</option>
            </select>
            <span className="text-xs text-stone-400 font-medium hidden sm:block">
              <span className="font-semibold text-stone-600">{meta.total}</span> peserta
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {["#", "Peserta", "Program Pelatihan", "Nilai", "Status", "Sertifikat", "Aksi"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider first:w-10 last:text-center last:w-32">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3.5 bg-stone-100 rounded w-5" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100" />
                        <div>
                          <div className="h-3.5 bg-stone-100 rounded w-36 mb-1.5" />
                          <div className="h-3 bg-stone-100 rounded w-24" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-3.5 bg-stone-100 rounded w-44" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-stone-100 rounded w-16" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-stone-100 rounded-full w-20" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-stone-100 rounded w-16" /></td>
                    <td className="px-5 py-4"><div className="h-6 bg-stone-100 rounded-lg w-24 mx-auto" /></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  const st = STATUS_MAP[item.status_peserta] ?? { label: item.status_peserta, dot: "bg-gray-400", cls: "bg-gray-100 text-gray-700 border-gray-200" };
                  const grade = item.nilai != null ? getGrade(item.nilai) : null;
                  const gradeCls = grade ? GRADE_MAP[grade] : "";

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors duration-100 group">
                      {/* No */}
                      <td className="px-5 py-4 text-sm font-medium text-stone-400">
                        {(meta.current_page - 1) * 10 + idx + 1}
                      </td>

                      {/* Peserta */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.foto ? (
                            <img src={`${BACKEND}${item.foto}`} alt="foto" className="w-9 h-9 rounded-full object-cover border-2 border-white ring-1 ring-stone-200 flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0 ring-1 ring-blue-200">
                              {(item.tenaga_kerja?.nama || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">
                              {item.tenaga_kerja?.nama ?? "-"}
                            </p>
                            <p className="text-xs text-stone-400 font-mono mt-0.5">NIK: {item.tenaga_kerja?.nik ?? "-"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program Pelatihan */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-stone-600 font-medium leading-snug line-clamp-2 max-w-[220px]">
                          {item.pelatihan?.nama_pelatihan ?? "-"}
                        </span>
                      </td>

                      {/* Nilai */}
                      <td className="px-5 py-4">
                        {item.nilai != null ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-stone-800">{item.nilai}</span>
                            {grade && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${gradeCls}`}>
                                {grade}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Belum dinilai</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>

                      {/* Sertifikat */}
                      <td className="px-5 py-4">
                        {item.sertifikasi ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Award className="w-3 h-3" /> Terbit
                          </span>
                        ) : item.status_peserta === "lulus" ? (
                          <span className="text-xs text-amber-600 font-medium">Belum diterbitkan</span>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link to={`/lpk/peserta-pelatihan/detail/${item.id}`}
                            className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Detail">
                            <Eye size={15} />
                          </Link>
                          <Link to={`/lpk/peserta-pelatihan/edit/${item.id}`}
                            className="p-2 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit / Nilai">
                            <Edit2 size={15} />
                          </Link>
                          <button onClick={() => setDeleteTarget(item)}
                            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                        <Users className="w-7 h-7 text-stone-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-600">Tidak ada data peserta</p>
                        <p className="text-xs text-stone-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Halaman <span className="font-semibold text-stone-600">{meta.current_page}</span> dari <span className="font-semibold text-stone-600">{meta.last_page}</span>
              {" · "}<span className="font-semibold text-stone-600">{meta.total}</span> total peserta
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.current_page === 1}
                className="p-2 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 transition text-stone-600 bg-white"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                      meta.current_page === pg
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "border border-stone-200 text-stone-600 hover:bg-white bg-white"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page === meta.last_page}
                className="p-2 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 transition text-stone-600 bg-white"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DELETE MODAL                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Hapus Data Peserta?</h3>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                Data peserta <span className="font-semibold text-stone-700">"{deleteTarget.tenaga_kerja?.nama}"</span> akan dihapus secara permanen dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-stone-200 px-4 py-2.5 rounded-xl text-sm hover:bg-stone-50 transition text-stone-700 font-medium"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-red-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import & History Modals */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={() => fetchData(1)} pelatihans={pelatihans} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
}