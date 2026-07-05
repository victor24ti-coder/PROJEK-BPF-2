import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Loader2, AlertTriangle, Award, CheckCircle,
  XCircle, Calendar, Eye, Edit2, Trash2, Download, FileText,
  ChevronLeft, ChevronRight, Filter, X, ShieldCheck
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";

const STATUS_MAP = {
  aktif:       { label: "Aktif",       dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  tidak_aktif: { label: "Tidak Aktif", dot: "bg-red-500",     cls: "bg-red-50 text-red-700 border-red-200" },
};

export default function Index() {
  const [data,      setData]      = useState([]);
  const [meta,      setMeta]      = useState({ current_page: 1, last_page: 1, total: 0 });
  const [stats,     setStats]     = useState({ total: 0, aktif: 0, tidakAktif: 0, bulanIni: 0 });
  const [pelatihans, setPelatihans] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [search,          setSearch]          = useState("");
  const [filterPelatihan, setFilterPelatihan] = useState("");
  const [filterStatus,    setFilterStatus]    = useState("");
  const [filterTahun,     setFilterTahun]     = useState("");
  const [page,            setPage]            = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [downloading,  setDownloading]  = useState(null);

  const tahunList = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchData = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pg,
        ...(search          && { search }),
        ...(filterPelatihan && { pelatihan_id: filterPelatihan }),
        ...(filterStatus    && { status: filterStatus }),
        ...(filterTahun     && { tahun: filterTahun }),
      });
      const res = await lpkPortalAPI.sertifikasi.getAll(params.toString());
      const payload = res.data;
      setData(payload.data?.data ?? []);
      setMeta({
        current_page: payload.data?.current_page ?? 1,
        last_page:    payload.data?.last_page    ?? 1,
        total:        payload.data?.total        ?? 0,
      });
      if (payload.stats) setStats(payload.stats);
    } catch {
      setError("Gagal memuat data sertifikasi. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, [search, filterPelatihan, filterStatus, filterTahun]);

  useEffect(() => {
    lpkPortalAPI.pelatihan.getAll().then(r => setPelatihans(r.data.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => { fetchData(page); }, [page, filterPelatihan, filterStatus, filterTahun, fetchData]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(1); };

  const handleDownload = async (item) => {
    setDownloading(item.id);
    try {
      const res = await lpkPortalAPI.sertifikasi.download(item.id);
      const url  = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href     = url;
      link.download = `sertifikat_${item.nomor_sertifikat}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("File sertifikat tidak ditemukan atau gagal diunduh.");
    } finally {
      setDownloading(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await lpkPortalAPI.sertifikasi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchData(page);
    } catch {
      alert("Gagal menghapus data sertifikasi.");
    } finally {
      setDeleting(false);
    }
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return "—";
    return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const statCards = [
    { label: "Total Sertifikat",      value: stats.total,      icon: Award,       bg: "bg-blue-50",    ic: "text-blue-600",    accent: "bg-blue-500" },
    { label: "Sertifikat Aktif",      value: stats.aktif,      icon: CheckCircle, bg: "bg-emerald-50", ic: "text-emerald-600", accent: "bg-emerald-500" },
    { label: "Tidak Aktif",           value: stats.tidakAktif, icon: XCircle,     bg: "bg-red-50",     ic: "text-red-500",     accent: "bg-red-500" },
    { label: "Terbit Bulan Ini",      value: stats.bulanIni,   icon: Calendar,    bg: "bg-amber-50",   ic: "text-amber-600",   accent: "bg-amber-500" },
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
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Sertifikasi</h1>
              <p className="text-sm text-stone-400 mt-0.5">Kelola data sertifikat peserta pelatihan yang telah diterbitkan oleh LPK.</p>
            </div>
          </div>
          <Link
            to="/lpk/sertifikasi/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all text-sm flex-shrink-0"
          >
            <Plus size={15} /> Tambah Sertifikat
          </Link>
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
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama peserta atau nomor sertifikat..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filterPelatihan}
                onChange={(e) => { setFilterPelatihan(e.target.value); setPage(1); }}
                className="text-sm bg-transparent outline-none text-stone-700 max-w-[150px]"
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
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>

            <select
              value={filterTahun}
              onChange={(e) => { setFilterTahun(e.target.value); setPage(1); }}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white outline-none text-stone-700 focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Semua Tahun</option>
              {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <span className="text-xs text-stone-400 font-medium hidden sm:block">
              <span className="font-semibold text-stone-600">{meta.total}</span> sertifikat
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
                {["No", "Peserta", "Pelatihan", "Nomor Sertifikat", "Tanggal Terbit", "Status", "File", "Aksi"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3.5 bg-stone-100 rounded w-5" /></td>
                    <td className="px-5 py-4">
                      <div className="h-4 bg-stone-100 rounded w-36 mb-1.5" />
                      <div className="h-3 bg-stone-100 rounded w-24" />
                    </td>
                    <td className="px-5 py-4"><div className="h-3.5 bg-stone-100 rounded w-40" /></td>
                    <td className="px-5 py-4"><div className="h-6 bg-stone-100 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-3.5 bg-stone-100 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-stone-100 rounded-full w-20" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-stone-100 rounded w-10" /></td>
                    <td className="px-5 py-4"><div className="h-6 bg-stone-100 rounded-lg w-28" /></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  const st = STATUS_MAP[item.status_sertifikat] ?? { label: item.status_sertifikat, dot: "bg-gray-400", cls: "bg-gray-100 text-gray-700 border-gray-200" };
                  const peserta   = item.peserta_pelatihan?.tenaga_kerja;
                  const pelatihan = item.peserta_pelatihan?.pelatihan;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors duration-100 group">
                      {/* No */}
                      <td className="px-5 py-4 text-sm font-medium text-stone-400">
                        {(meta.current_page - 1) * 10 + idx + 1}
                      </td>

                      {/* Peserta */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0 ring-1 ring-blue-200">
                            {(peserta?.nama || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-stone-800 group-hover:text-blue-600 transition-colors">
                              {peserta?.nama ?? "—"}
                            </p>
                            <p className="text-xs text-stone-400 font-mono mt-0.5">NIK: {peserta?.nik ?? "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Pelatihan */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-stone-600 font-medium line-clamp-2 max-w-[180px] block">
                          {pelatihan?.nama_pelatihan ?? "—"}
                        </span>
                      </td>

                      {/* Nomor Sertifikat */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-mono font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                            {item.nomor_sertifikat}
                          </span>
                        </div>
                      </td>

                      {/* Tanggal Terbit */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-stone-600">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          {formatTanggal(item.tanggal_terbit)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>

                      {/* File */}
                      <td className="px-5 py-4">
                        {item.file_sertifikat ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <FileText size={12} /> PDF
                          </span>
                        ) : (
                          <span className="text-xs text-stone-300 italic">—</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link to={`/lpk/sertifikasi/detail/${item.id}`}
                            className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Detail">
                            <Eye size={15} />
                          </Link>
                          {item.file_sertifikat && (
                            <button
                              onClick={() => handleDownload(item)}
                              disabled={downloading === item.id}
                              className="p-2 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-40" title="Unduh PDF"
                            >
                              {downloading === item.id
                                ? <Loader2 size={15} className="animate-spin" />
                                : <Download size={15} />}
                            </button>
                          )}
                          <Link to={`/lpk/sertifikasi/edit/${item.id}`}
                            className="p-2 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit">
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
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                        <Award className="w-7 h-7 text-stone-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-600">Tidak ada data sertifikasi</p>
                        <p className="text-xs text-stone-400 mt-1">Coba ubah filter atau tambahkan sertifikat baru</p>
                      </div>
                      <Link to="/lpk/sertifikasi/create" className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                        <Plus className="w-3.5 h-3.5" /> Tambah Sertifikat
                      </Link>
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
              {" · "}<span className="font-semibold text-stone-600">{meta.total}</span> total sertifikat
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={meta.current_page === 1}
                className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 transition text-stone-600"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                      meta.current_page === pg
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "border border-stone-200 text-stone-600 hover:bg-stone-50 bg-white"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page === meta.last_page}
                className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 transition text-stone-600"
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
              <h3 className="text-lg font-bold text-stone-900">Hapus Sertifikat?</h3>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                Sertifikat <span className="font-semibold text-stone-700 font-mono">"{deleteTarget.nomor_sertifikat}"</span> akan dihapus secara permanen.
                {deleteTarget.file_sertifikat && " File PDF sertifikat juga akan ikut terhapus."}
                {" "}Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
}