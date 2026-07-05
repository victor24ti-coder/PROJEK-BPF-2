import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Search, Loader2, AlertTriangle, BookOpen, Eye, Edit2, Trash2,
  Calendar, Users, Award, GraduationCap, Filter, X, ChevronRight, ArrowUpRight
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";

export default function Index() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // State untuk delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNama, setDeleteNama] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // State untuk stats
  const [stats, setStats] = useState({ total: 0, aktif: 0, selesai: 0, kuota: 0 });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lpkPortalAPI.pelatihan.getAll();
      const rawData = res.data.data ?? [];
      setData(rawData);

      const total = rawData.length;
      const aktif = rawData.filter(item => ["aktif", "dibuka"].includes((item.status || "").toLowerCase())).length;
      const selesai = rawData.filter(item => (item.status || "").toLowerCase() === "selesai").length;
      const kuota = rawData.reduce((acc, curr) => acc + (parseInt(curr.kuota) || 0), 0);
      setStats({ total, aktif, selesai, kuota });
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pelatihan dari server. Pastikan server backend Anda berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteClick = (id, nama) => {
    setDeleteId(id);
    setDeleteNama(nama);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await lpkPortalAPI.pelatihan.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteNama("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data pelatihan. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredData = data.filter(item =>
    (item.nama_pelatihan || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.jenis_pelatihan || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.jurusan || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const norm = (status || "").toLowerCase();
    const map = {
      aktif:   { dot: "bg-emerald-500 animate-pulse", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Aktif" },
      dibuka:  { dot: "bg-blue-500",                  cls: "bg-blue-50 text-blue-700 border-blue-200",         label: "Dibuka" },
      selesai: { dot: "bg-stone-400",                 cls: "bg-stone-100 text-stone-600 border-stone-200",     label: "Selesai" },
      ditutup: { dot: "bg-red-500",                   cls: "bg-red-50 text-red-700 border-red-200",            label: "Ditutup" },
    };
    const s = map[norm] || { dot: "bg-gray-400", cls: "bg-gray-50 text-gray-600 border-gray-200", label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  const statCards = [
    { label: "Total Kelas",  value: stats.total,            suffix: "kelas",  icon: BookOpen,      bg: "bg-blue-50",    ic: "text-blue-600",    accent: "bg-blue-500" },
    { label: "Kelas Aktif",  value: stats.aktif,            suffix: "kelas",  icon: Award,         bg: "bg-emerald-50", ic: "text-emerald-600", accent: "bg-emerald-500" },
    { label: "Selesai",      value: stats.selesai,          suffix: "kelas",  icon: GraduationCap, bg: "bg-stone-100",  ic: "text-stone-600",   accent: "bg-stone-400" },
    { label: "Total Kuota",  value: stats.kuota,            suffix: "kursi",  icon: Users,         bg: "bg-purple-50",  ic: "text-purple-600",  accent: "bg-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PAGE HEADER                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Program Pelatihan Kerja</h1>
              <p className="text-sm text-stone-400 mt-0.5">
                Kelola, lihat detail, perbarui, dan hapus program pelatihan LPK Anda.
              </p>
            </div>
          </div>
          <Link
            to="/lpk/pelatihan/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-150 text-sm flex-shrink-0"
          >
            <Plus size={16} />
            Tambah Pelatihan
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
                <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-stone-900">{s.value}</p>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mt-1">
                {s.label}
              </p>
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
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pelatihan, kejuruan, status..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Menampilkan <span className="font-semibold text-stone-600">{filteredData.length}</span> dari <span className="font-semibold text-stone-600">{data.length}</span> data</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider w-12">#</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Nama Program</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Kejuruan</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Kuota</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-center text-[11px] font-semibold text-stone-400 uppercase tracking-wider w-32">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3.5 bg-stone-100 rounded w-6" /></td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-stone-100 rounded w-52 mb-2" />
                      <div className="h-3 bg-stone-100 rounded w-36" />
                    </td>
                    <td className="px-6 py-4"><div className="h-5 bg-stone-100 rounded-md w-24" /></td>
                    <td className="px-6 py-4"><div className="h-3.5 bg-stone-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-3.5 bg-stone-100 rounded w-14" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-stone-100 rounded-full w-20" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-stone-100 rounded-lg w-24 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-100 group">
                    {/* No */}
                    <td className="px-6 py-4 text-sm font-medium text-stone-400">{index + 1}</td>

                    {/* Nama & Tanggal */}
                    <td className="px-6 py-4">
                      <Link
                        to={`/lpk/pelatihan/detail/${item.id}`}
                        className="text-sm font-semibold text-stone-800 hover:text-blue-600 transition-colors group-hover:text-blue-600 flex items-center gap-1.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="truncate max-w-[220px]">{item.nama_pelatihan}</span>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1.5 ml-9">
                        <Calendar className="w-3 h-3" />
                        <span>{item.tanggal_mulai} s/d {item.tanggal_selesai}</span>
                      </div>
                    </td>

                    {/* Kejuruan */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        {item.jurusan || "-"}
                      </span>
                    </td>

                    {/* Jenis */}
                    <td className="px-6 py-4 text-sm text-stone-500">{item.jenis_pelatihan || "-"}</td>

                    {/* Kuota */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-stone-600 font-medium">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {item.kuota}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>

                    {/* Aksi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/lpk/pelatihan/detail/${item.id}`}
                          className="p-2 rounded-lg text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/lpk/pelatihan/edit/${item.id}`}
                          className="p-2 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-150"
                          title="Edit Pelatihan"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.nama_pelatihan)}
                          className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                          title="Hapus Pelatihan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-stone-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-600">
                          {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada program pelatihan"}
                        </p>
                        <p className="text-xs text-stone-400 mt-1">
                          {search ? "Coba kata kunci yang berbeda" : "Mulai dengan menambahkan program pelatihan pertama Anda"}
                        </p>
                      </div>
                      {!search && (
                        <Link to="/lpk/pelatihan/create" className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          <Plus className="w-3.5 h-3.5" /> Tambah Pelatihan
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Total <span className="font-semibold text-stone-600">{filteredData.length}</span> program pelatihan
            </p>
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Hapus Program Pelatihan?</h3>
              <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                Program <span className="font-semibold text-stone-700">"{deleteNama}"</span> akan dihapus secara permanen dan tidak dapat dipulihkan kembali.
              </p>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteId(null); setDeleteNama(""); }}
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