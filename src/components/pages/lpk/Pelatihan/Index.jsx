import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Loader2, AlertTriangle, BookOpen, Eye, Edit2, Trash2, Calendar, Users, Award, GraduationCap } from "lucide-react";
import { pelatihanAPI } from "../../../../services/api";

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
  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    selesai: 0,
    kuota: 0
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pelatihanAPI.getAll();
      const rawData = res.data.data ?? [];
      setData(rawData);

      // Hitung statistik singkat
      const total = rawData.length;
      const aktif = rawData.filter(item => item.status === "Aktif" || item.status === "aktif" || item.status === "Dibuka").length;
      const selesai = rawData.filter(item => item.status === "Selesai" || item.status === "selesai").length;
      const kuota = rawData.reduce((acc, curr) => acc + (parseInt(curr.kuota) || 0), 0);
      
      setStats({ total, aktif, selesai, kuota });
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pelatihan dari server. Pastikan server backend Anda berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id, nama) => {
    setDeleteId(id);
    setDeleteNama(nama);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await pelatihanAPI.delete(deleteId);
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

  // Filter data berdasarkan input pencarian
  const filteredData = data.filter(item => 
    (item.nama_pelatihan || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.jenis_pelatihan || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.jurusan || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.status || "").toLowerCase().includes(search.toLowerCase())
  );

  // Helper styling untuk status badge
  const getStatusBadge = (status) => {
    const normStatus = (status || "").toLowerCase();
    switch (normStatus) {
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif
          </span>
        );
      case "dibuka":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Dibuka
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Selesai
          </span>
        );
      case "ditutup":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Ditutup
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-850 tracking-tight">
            Program Pelatihan Kerja
          </h1>
          <p className="text-stone-500 mt-1">
            Kelola, lihat detail, perbarui, dan hapus kelas pelatihan yang diselenggarakan LPK Anda.
          </p>
        </div>

        <Link
          to="/lpk/pelatihan/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-150"
        >
          <Plus size={18} />
          Tambah Pelatihan
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Total Kelas</p>
            <h4 className="text-xl font-bold text-stone-850 mt-0.5">{stats.total} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Kelas Aktif</p>
            <h4 className="text-xl font-bold text-stone-850 mt-0.5">{stats.aktif} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Selesai</p>
            <h4 className="text-xl font-bold text-stone-850 mt-0.5">{stats.selesai} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Total Kuota</p>
            <h4 className="text-xl font-bold text-stone-850 mt-0.5">{stats.kuota} Kursi</h4>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Search and Filters */}
        <div className="p-5 border-b border-stone-150 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pelatihan, kejuruan, atau status..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
            />
          </div>
          <div className="text-xs text-stone-500 font-medium">
            Menampilkan {filteredData.length} dari {data.length} data pelatihan
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-16">
                  #
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Nama Program Pelatihan
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Kejuruan / Bidang
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Jenis
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-28">
                  Kuota
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-28">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider w-36">
                  Aksi
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-stone-150">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-6"></div></td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-stone-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-stone-100 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-stone-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-stone-200 rounded-lg w-24 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors duration-100">
                    <td className="px-6 py-4 text-sm font-medium text-stone-500">
                      {index + 1}.
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-stone-850 hover:text-blue-600 transition-colors">
                        <Link to={`/lpk/pelatihan/detail/${item.id}`}>{item.nama_pelatihan}</Link>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.tanggal_mulai} s/d {item.tanggal_selesai}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {item.jurusan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {item.jenis_pelatihan}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 font-semibold">
                      {item.kuota} Kursi
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <Link
                          to={`/lpk/pelatihan/detail/${item.id}`}
                          className="text-stone-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-stone-100 transition-all duration-150"
                          title="Detail Pelatihan"
                        >
                          <Eye size={17} />
                        </Link>
                        <Link
                          to={`/lpk/pelatihan/edit/${item.id}`}
                          className="text-stone-500 hover:text-amber-600 p-1.5 rounded-lg hover:bg-stone-100 transition-all duration-150"
                          title="Ubah Pelatihan"
                        >
                          <Edit2 size={17} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.nama_pelatihan)}
                          className="text-stone-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-100 transition-all duration-150"
                          title="Hapus Pelatihan"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-stone-500">
                    {search ? `Tidak ada pelatihan ditemukan untuk "${search}"` : "Belum ada program pelatihan kerja yang ditambahkan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-stone-850 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus program pelatihan <strong>{deleteNama}</strong>? Tindakan ini akan menghapus data secara permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                  setDeleteNama("");
                }}
                className="border border-stone-300 px-4 py-2 rounded-lg text-sm hover:bg-stone-55 transition text-stone-700 font-medium"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 font-medium flex items-center gap-2"
              >
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