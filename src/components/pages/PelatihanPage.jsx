import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, AlertTriangle, BookOpen, Eye, Award, GraduationCap, Users, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { pelatihanAPI, lpkAPI } from "../../services/api";

const emptyForm = {
  lpk_id: "",
  nama_pelatihan: "",
  jenis_pelatihan: "APBD", // APBD, APBN, Mandiri
  jurusan: "",
  deskripsi: "",
  kuota: "",
  status: "aktif", // aktif, selesai
  tanggal_mulai: "",
  tanggal_selesai: "",
};

export default function PelatihanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [lpks, setLpks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Custom delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNama, setDeleteNama] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State untuk ringkasan stats
  const [stats, setStats] = useState({ total: 0, berjalan: 0, selesai: 0, peserta: 0 });

  // Pagination state
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchData = async (keyword = search, pg = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await pelatihanAPI.getAll('true', keyword, '', pg);
      const payload = res.data.data;
      setData(payload.data ?? []);
      setMeta({
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
      });
    } catch (err) {
      setError("Gagal memuat data pelatihan dari server.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await pelatihanAPI.getAll('false');
      const rawData = res.data.data ?? [];
      const total = rawData.length;
      const berjalan = rawData.filter((item) => item.status === "aktif").length;
      const selesai = rawData.filter((item) => item.status === "selesai").length;
      const peserta = rawData.reduce((acc, curr) => acc + (curr.peserta?.length || 0), 0);
      setStats({ total, berjalan, selesai, peserta });
    } catch {}
  };

  const fetchLpks = async () => {
    try {
      const res = await lpkAPI.getAll("false");
      const rawData = res.data.data;
      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        setLpks(rawData.data);
      } else {
        setLpks(rawData ?? []);
      }
    } catch (err) {
      console.error("Gagal memuat LPK:", err);
    }
  };

  useEffect(() => {
    fetchData(search, page);
  }, [page]);

  useEffect(() => {
    fetchStats();
    fetchLpks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(search, 1);
  };

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      lpk_id: item.lpk_id || "",
      nama_pelatihan: item.nama_pelatihan || "",
      jenis_pelatihan: item.jenis_pelatihan || "APBD",
      jurusan: item.jurusan || "",
      deskripsi: item.deskripsi || "",
      kuota: item.kuota || "",
      status: item.status || "aktif",
      tanggal_mulai: item.tanggal_mulai || "",
      tanggal_selesai: item.tanggal_selesai || "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id, nama) => {
    setDeleteId(id);
    setDeleteNama(nama);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await pelatihanAPI.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteNama("");
      fetchData(search);
    } catch {
      alert("Gagal menghapus data pelatihan.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editId) {
        await pelatihanAPI.update(editId, form);
      } else {
        await pelatihanAPI.create(form);
      }
      setShowModal(false);
      fetchData(search);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        alert("Terjadi kesalahan, coba lagi");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  // Badge warna untuk Kategori Kejuruan
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Teknik Las":
        return "bg-red-50 text-red-700 border-red-100";
      case "Teknik Otomotif":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "Teknik Informasi":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Kelistrikan":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "Tata Boga":
        return "bg-purple-50 text-purple-700 border-purple-100";
      default:
        return "bg-stone-50 text-stone-700 border-stone-100";
    }
  };

  // Badge status pelatihan
  const getStatusBadge = (status) => {
    switch (status) {
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-850 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-50/50">
      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Total Program</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.total} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Aktif</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.berjalan} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Selesai</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.selesai} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Total Peserta</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.peserta} Orang</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        {/* Header Table Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Program Pelatihan Kerja</h2>
            <p className="text-sm text-stone-500 mt-1">
              Data pendaftaran, penyelenggaraan, and LPK pelaksana pelatihan di Provinsi Riau.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); fetchData(e.target.value, 1); }}
                placeholder="Cari kelas, kejuruan, atau LPK..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </form>

            <button
              onClick={openTambah}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1.5"
            >
              + Tambah Pelatihan
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Nama Program Pelatihan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Kejuruan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Penyelenggara LPK
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-24">
                    Kuota
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-28">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider w-36">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-6"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-56"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-36"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-5 bg-stone-200 rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-stone-200 rounded-lg w-24 mx-auto"></div></td>
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-stone-600">
                        {(meta.current_page - 1) * 10 + index + 1}.
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/pelatihan/${item.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {item.nama_pelatihan}
                        </Link>
                        <p className="text-xs text-stone-400 mt-0.5">Jenis: {item.jenis_pelatihan}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(item.jurusan)}`}>
                          {item.jurusan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-700">
                        {item.lpk?.nama_lpk || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-stone-850">{item.peserta?.length || 0}</span>
                          <span className="text-stone-400">/</span>
                          <span className="text-stone-500">{item.kuota} pax</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Link
                            to={`/pelatihan/${item.id}`}
                            className="text-stone-600 hover:text-blue-600 transition-colors"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEdit(item)}
                            className="text-stone-600 hover:text-amber-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama_pelatihan)}
                            className="text-stone-600 hover:text-red-650 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-stone-500">
                      Tidak ada program pelatihan ditemukan{search ? ` untuk kata kunci "${search}"` : ""}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
              <p className="text-xs text-stone-500">
                Halaman {meta.current_page} dari {meta.last_page}
                <span className="ml-2 text-stone-400">(Total: {meta.total} pelatihan)</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page === 1}
                  className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page === meta.last_page}
                  className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xl mx-4 p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-stone-900 mb-4 border-b pb-2">
              {editId ? "Edit Pelatihan Kerja" : "Tambah Pelatihan Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Nama Pelatihan</label>
                  <input
                    type="text"
                    name="nama_pelatihan"
                    value={form.nama_pelatihan}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.nama_pelatihan ? "border-red-400" : "border-stone-300"
                    }`}
                    required
                  />
                  {errors.nama_pelatihan && <p className="text-red-500 text-xs mt-1">{errors.nama_pelatihan[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Penyelenggara LPK</label>
                  <select
                    name="lpk_id"
                    value={form.lpk_id}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.lpk_id ? "border-red-400" : "border-stone-300"
                    }`}
                    required
                  >
                    <option value="">-- Pilih LPK --</option>
                    {lpks.map((lpk) => (
                      <option key={lpk.id} value={lpk.id}>
                        {lpk.nama_lpk}
                      </option>
                    ))}
                  </select>
                  {errors.lpk_id && <p className="text-red-500 text-xs mt-1">{errors.lpk_id[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Jenis Pelatihan</label>
                  <select
                    name="jenis_pelatihan"
                    value={form.jenis_pelatihan}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="APBD">APBD</option>
                    <option value="APBN">APBN</option>
                    <option value="Mandiri">Mandiri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Kejuruan / Bidang</label>
                  <input
                    type="text"
                    name="jurusan"
                    value={form.jurusan}
                    onChange={handleChange}
                    placeholder="Contoh: Teknik Informasi"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.jurusan ? "border-red-400" : "border-stone-300"
                    }`}
                    required
                  />
                  {errors.jurusan && <p className="text-red-500 text-xs mt-1">{errors.jurusan[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Kuota Peserta</label>
                  <input
                    type="number"
                    name="kuota"
                    value={form.kuota}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.kuota ? "border-red-400" : "border-stone-300"
                    }`}
                    required
                  />
                  {errors.kuota && <p className="text-red-500 text-xs mt-1">{errors.kuota[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={form.tanggal_mulai}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.tanggal_mulai ? "border-red-400" : "border-stone-300"
                    }`}
                    required
                  />
                  {errors.tanggal_mulai && <p className="text-red-500 text-xs mt-1">{errors.tanggal_mulai[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    name="tanggal_selesai"
                    value={form.tanggal_selesai}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors.tanggal_selesai ? "border-red-400" : "border-stone-300"
                    }`}
                    required
                  />
                  {errors.tanggal_selesai && <p className="text-red-500 text-xs mt-1">{errors.tanggal_selesai[0]}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-stone-300 px-5 py-2 rounded-lg text-sm hover:bg-stone-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Kelas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-stone-600 mb-4">
              Apakah Anda yakin ingin menghapus program pelatihan <strong>{deleteNama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 font-medium"
              >
                {saving ? "Menghapus..." : "Ya, Hapus"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                  setDeleteNama("");
                }}
                className="border border-stone-300 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 transition font-medium text-stone-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
