import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Plus, Loader2, AlertTriangle, Award, CheckCircle,
  XCircle, Calendar, Eye, Edit2, Trash2, Download, FileText,
  ChevronLeft, ChevronRight, Filter
} from "lucide-react";
import { sertifikasiAPI, pelatihanAPI } from "../../../../services/api";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_MAP = {
  aktif:       { label: "Aktif",       cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle size={12} /> },
  tidak_aktif: { label: "Tidak Aktif", cls: "bg-red-50 text-red-700 border-red-100",             icon: <XCircle size={12} /> },
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
      const res = await sertifikasiAPI.getAll(params.toString());
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
    pelatihanAPI.getAll().then(r => setPelatihans(r.data.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, filterPelatihan, filterStatus, filterTahun, fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1);
  };

  const handleDownload = async (item) => {
    setDownloading(item.id);
    try {
      const res = await sertifikasiAPI.download(item.id);
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
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
      await sertifikasiAPI.delete(deleteTarget.id);
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
    return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-850 tracking-tight">Sertifikasi</h1>
          <p className="text-stone-500 mt-1">Kelola data sertifikat peserta pelatihan yang telah diterbitkan oleh LPK.</p>
        </div>
        <Link
          to="/lpk/sertifikasi/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
        >
          <Plus size={16} />
          Tambah Sertifikat
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sertifikat",        val: stats.total,      icon: <Award size={20} />,        bg: "bg-blue-50    text-blue-600"   },
          { label: "Sertifikat Aktif",         val: stats.aktif,      icon: <CheckCircle size={20} />,  bg: "bg-emerald-50 text-emerald-600" },
          { label: "Sertifikat Tidak Aktif",   val: stats.tidakAktif, icon: <XCircle size={20} />,      bg: "bg-red-50     text-red-600"     },
          { label: "Diterbitkan Bulan Ini",    val: stats.bulanIni,   icon: <Calendar size={20} />,     bg: "bg-amber-50   text-amber-600"   },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider leading-tight">{s.label}</p>
              <h4 className="text-xl font-bold text-stone-850 mt-0.5">{s.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-stone-150 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between flex-wrap">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama peserta atau nomor sertifikat..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </form>

          <div className="flex gap-2 flex-wrap items-center">
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
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>

            <select
              value={filterTahun}
              onChange={(e) => { setFilterTahun(e.target.value); setPage(1); }}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-stone-50 outline-none text-stone-700 focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Semua Tahun</option>
              {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
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
                {["No", "Peserta", "Pelatihan", "Nomor Sertifikat", "Tanggal Terbit", "Status", "File", "Aksi"].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-150">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-stone-200 rounded w-full"></div></td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  const st = STATUS_MAP[item.status_sertifikat] ?? { label: item.status_sertifikat, cls: "bg-gray-100 text-gray-700", icon: null };
                  const peserta = item.peserta_pelatihan?.tenaga_kerja;
                  const pelatihan = item.peserta_pelatihan?.pelatihan;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-stone-500 font-medium">
                        {(meta.current_page - 1) * 10 + idx + 1}.
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-stone-850">{peserta?.nama ?? "—"}</p>
                        <p className="text-xs text-stone-400">NIK: {peserta?.nik ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-700 max-w-[160px] truncate" title={pelatihan?.nama_pelatihan}>
                        {pelatihan?.nama_pelatihan ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-mono font-semibold text-stone-850 bg-stone-100 px-2 py-0.5 rounded">
                          {item.nomor_sertifikat}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-stone-600">{formatTanggal(item.tanggal_terbit)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.cls}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {item.file_sertifikat ? (
                          <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <FileText size={14} />
                            PDF
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Belum ada</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/lpk/sertifikasi/detail/${item.id}`}
                            className="text-stone-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-stone-100 transition" title="Detail">
                            <Eye size={16} />
                          </Link>
                          {item.file_sertifikat && (
                            <button
                              onClick={() => handleDownload(item)}
                              disabled={downloading === item.id}
                              className="text-stone-500 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-stone-100 transition disabled:opacity-50" title="Unduh PDF"
                            >
                              {downloading === item.id
                                ? <Loader2 size={16} className="animate-spin" />
                                : <Download size={16} />}
                            </button>
                          )}
                          <Link to={`/lpk/sertifikasi/edit/${item.id}`}
                            className="text-stone-500 hover:text-amber-600 p-1.5 rounded-lg hover:bg-stone-100 transition" title="Edit">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => setDeleteTarget(item)}
                            className="text-stone-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-100 transition" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center text-sm text-stone-500">
                    Tidak ada data sertifikasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-stone-150 flex items-center justify-between">
            <p className="text-xs text-stone-500">Halaman {meta.current_page} dari {meta.last_page} · Total {meta.total} sertifikat</p>
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

      {/* Modal Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-stone-850 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus sertifikat <strong className="text-stone-850">{deleteTarget.nomor_sertifikat}</strong>?
              {deleteTarget.file_sertifikat && " File PDF sertifikat juga akan ikut terhapus."}
              {" "}Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
}