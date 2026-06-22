import { useEffect, useState } from "react";
import { Search, Loader2, AlertTriangle, Compass, Briefcase, UserCheck, HelpCircle, Edit2, Trash2 } from "lucide-react";
import { tracerStudyAPI, tenagaKerjaAPI } from "../../services/api";

const emptyForm = {
  tenaga_kerja_id: "",
  status_alumni: "belum_bekerja", // bekerja_sesuai_bidang, membuka_usaha, belum_bekerja
  nama_perusahaan: "",
  jabatan: "",
  gaji: "",
  keterangan: "",
  tanggal_update: "",
};

export default function TracerStudyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [tenagaKerjaList, setTenagaKerjaList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Custom delete state
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, bekerja: 0, wirausaha: 0, mencari: 0 });

  const fetchData = async (keyword = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await tracerStudyAPI.getAll(keyword);
      const rawData = res.data.data ?? [];
      setData(rawData);

      // Recalculate stats
      const total = rawData.length;
      const bekerja = rawData.filter((item) => item.status_alumni === "bekerja_sesuai_bidang").length;
      const wirausaha = rawData.filter((item) => item.status_alumni === "membuka_usaha").length;
      const mencari = rawData.filter((item) => item.status_alumni === "belum_bekerja").length;
      setStats({ total, bekerja, wirausaha, mencari });
    } catch (err) {
      setError("Gagal memuat data penelusuran alumni (Tracer Study).");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenagaKerja = async () => {
    try {
      const res = await tenagaKerjaAPI.getAll("false");
      const rawData = res.data.data;
      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        setTenagaKerjaList(rawData.data);
      } else {
        setTenagaKerjaList(rawData ?? []);
      }
    } catch (err) {
      console.error("Gagal memuat daftar tenaga kerja:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTenagaKerja();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const openTambah = () => {
    setEditId(null);
    setForm({
      ...emptyForm,
      tanggal_update: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      tenaga_kerja_id: item.tenaga_kerja_id || "",
      status_alumni: item.status_alumni || "belum_bekerja",
      nama_perusahaan: item.nama_perusahaan || "",
      jabatan: item.jabatan || "",
      gaji: item.gaji || "",
      keterangan: item.keterangan || "",
      tanggal_update: item.tanggal_update || "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await tracerStudyAPI.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData(search);
    } catch {
      alert("Gagal menghapus data.");
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
        await tracerStudyAPI.update(editId, form);
      } else {
        await tracerStudyAPI.create(form);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case "bekerja_sesuai_bidang":
        return "Bekerja (Sesuai Bidang)";
      case "membuka_usaha":
        return "Membuka Usaha (Wirausaha)";
      case "belum_bekerja":
        return "Belum Bekerja / Mencari";
      default:
        return status;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "bekerja_sesuai_bidang":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            Bekerja
          </span>
        );
      case "membuka_usaha":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
            Wirausaha
          </span>
        );
      case "belum_bekerja":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
            Belum Bekerja
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
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Total Tracer</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.total} Alumni</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Bekerja</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.bekerja} Orang</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Wirausaha</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.wirausaha} Orang</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Belum Bekerja</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.mencari} Orang</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        {/* Header Table Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Tracer Study (Penelusuran Alumni)</h2>
            <p className="text-sm text-stone-500 mt-1">
              Pantau status penyerapan alumni pelatihan kerja di Provinsi Riau ke dunia usaha atau industri.
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari alumni, perusahaan, atau status..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </form>

            <button
              onClick={openTambah}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              + Input Tracer Alumni
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-650 flex-shrink-0" />
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
                    Nama Alumni
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    NIK / Kontak
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Status Alumni
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Penempatan Kerja / Usaha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-32">
                    Tgl Update
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-6"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-40"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-5 bg-stone-200 rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-stone-200 rounded-lg w-16 mx-auto"></div></td>
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-stone-600">
                        {index + 1}.
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-stone-850">
                        {item.tenaga_kerja?.nama || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        <p className="font-semibold text-stone-700">NIK: {item.tenaga_kerja?.nik || "-"}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{item.tenaga_kerja?.no_hp || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(item.status_alumni)}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-700">
                        {item.status_alumni === "belum_bekerja" ? (
                          <span className="text-stone-450 italic">Tidak ada</span>
                        ) : (
                          <div>
                            <p className="font-bold">{item.nama_perusahaan || "-"}</p>
                            <p className="text-xs text-stone-500">{item.jabatan || "-"} | Gaji: {item.gaji || "-"}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500 font-medium">
                        {item.tanggal_update || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEdit(item)}
                            className="text-stone-650 hover:text-amber-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.tenaga_kerja?.nama)}
                            className="text-stone-650 hover:text-red-650 transition-colors"
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
                      Tidak ada data penelusuran tracer study ditemukan{search ? ` untuk kata kunci "${search}"` : ""}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Input / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-stone-900 mb-4 border-b pb-2">
              {editId ? "Update Status Alumni" : "Input Tracer Study Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Pilih Alumni (Tenaga Kerja)</label>
                <select
                  name="tenaga_kerja_id"
                  value={form.tenaga_kerja_id}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.tenaga_kerja_id ? "border-red-400" : "border-stone-300"
                  }`}
                  required
                  disabled={!!editId}
                >
                  <option value="">-- Pilih Alumni --</option>
                  {tenagaKerjaList.map((tk) => (
                    <option key={tk.id} value={tk.id}>
                      {tk.nama} (NIK: {tk.nik})
                    </option>
                  ))}
                </select>
                {errors.tenaga_kerja_id && <p className="text-red-500 text-xs mt-1">{errors.tenaga_kerja_id[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Status Penyerapan Kerja</label>
                <select
                  name="status_alumni"
                  value={form.status_alumni}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="bekerja_sesuai_bidang">Bekerja (Sesuai Bidang)</option>
                  <option value="membuka_usaha">Membuka Usaha (Wirausaha)</option>
                  <option value="belum_bekerja">Belum Bekerja / Mencari Kerja</option>
                </select>
              </div>

              {form.status_alumni !== "belum_bekerja" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideDown">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                      {form.status_alumni === "membuka_usaha" ? "Nama Usaha" : "Nama Perusahaan"}
                    </label>
                    <input
                      type="text"
                      name="nama_perusahaan"
                      value={form.nama_perusahaan}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Jabatan / Posisi</label>
                    <input
                      type="text"
                      name="jabatan"
                      value={form.jabatan}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Rata-rata Pendapatan / Gaji</label>
                    <input
                      type="text"
                      name="gaji"
                      value={form.gaji}
                      onChange={handleChange}
                      placeholder="Contoh: Rp 3.500.000"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Tanggal Update Status</label>
                    <input
                      type="date"
                      name="tanggal_update"
                      value={form.tanggal_update}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Catatan Tambahan / Keterangan</label>
                <textarea
                  name="keterangan"
                  value={form.keterangan}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Contoh: Bekerja paruh waktu, usaha kuliner, dll."
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
                  {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan Data"}
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
              Apakah Anda yakin ingin menghapus data Tracer Study ini? Tindakan ini tidak dapat dibatalkan.
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
