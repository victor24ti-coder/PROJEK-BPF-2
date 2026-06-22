import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle, Calendar, User, Clock, Building2, BookOpen, CheckCircle, ShieldAlert, Plus, Trash2, Check, X, Users } from "lucide-react";
import { pelatihanAPI, tenagaKerjaAPI, pesertaPelatihanAPI } from "../../services/api";

export default function PelatihanDetailPage() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States untuk tambah peserta
  const [showAddModal, setShowAddModal] = useState(false);
  const [tenagaKerjaList, setTenagaKerjaList] = useState([]);
  const [searchTrainee, setSearchTrainee] = useState("");
  const [addingTrainee, setAddingTrainee] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pelatihanAPI.getById(id);
      setProgram(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat rincian kelas pelatihan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenagaKerja = async () => {
    try {
      const res = await tenagaKerjaAPI.getAll("false"); // fetch all non-paginated
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
    fetchDetails();
    fetchTenagaKerja();
  }, [id]);

  // Tambah peserta ke pelatihan
  const handleAddPeserta = async (tenagaKerjaId) => {
    setAddingTrainee(true);
    try {
      await pesertaPelatihanAPI.create({
        tenaga_kerja_id: tenagaKerjaId,
        pelatihan_id: id,
        status_peserta: "aktif",
      });
      setShowAddModal(false);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambahkan peserta ke kelas ini.");
    } finally {
      setAddingTrainee(false);
    }
  };

  // Hapus peserta dari pelatihan
  const handleRemovePeserta = async (pesertaId, nama) => {
    if (!confirm(`Keluarkan ${nama} dari program pelatihan ini?`)) return;
    try {
      await pesertaPelatihanAPI.delete(pesertaId);
      fetchDetails();
    } catch {
      alert("Gagal mengeluarkan peserta.");
    }
  };

  // Update status kelulusan peserta
  const handleUpdateStatus = async (pesertaId, newStatus) => {
    try {
      await pesertaPelatihanAPI.update(pesertaId, {
        status_peserta: newStatus,
      });
      fetchDetails();
    } catch {
      alert("Gagal mengubah status kelulusan peserta.");
    }
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

  // Badge status peserta
  const getStatusBadge = (status) => {
    switch (status) {
      case "aktif":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
            Aktif
          </span>
        );
      case "lulus":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            Lulus
          </span>
        );
      case "tidak_lulus":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-100">
            Tidak Lulus
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-55 text-stone-700 border border-stone-150">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-stone-50/50 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium text-stone-500">Memuat rincian kelas pelatihan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50/50 p-6">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-6 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-red-650 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-sm text-stone-600 mb-6">{error}</p>
          <Link
            to="/pelatihan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pelatihan
          </Link>
        </div>
      </div>
    );
  }

  if (!program) return null;

  // Filter out Tenaga Kerja yang sudah terdaftar
  const enrolledIds = program.peserta?.map((p) => p.tenaga_kerja_id) ?? [];
  const filteredTrainees = tenagaKerjaList.filter(
    (tk) =>
      !enrolledIds.includes(tk.id) &&
      (tk.nama.toLowerCase().includes(searchTrainee.toLowerCase()) ||
        tk.nik.includes(searchTrainee))
  );

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-50/50">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          to="/pelatihan"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6 group transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Daftar Pelatihan
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          <div className="p-8 border-b border-stone-150 bg-stone-50/50">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(program.jurusan)}`}>
                {program.jurusan}
              </span>
              <span className="text-xs text-stone-400 font-medium">ID Kelas: PLT-{program.id.toString().padStart(3, "0")}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
              {program.nama_pelatihan}
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed max-w-3xl">
              {program.deskripsi || "Tidak ada deskripsi pelatihan."}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-150 bg-white">
            {/* LPK */}
            <div className="p-5 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">LPK Penyelenggara</p>
                <p className="text-sm font-bold text-stone-850 mt-0.5">{program.lpk?.nama_lpk || "-"}</p>
              </div>
            </div>

            {/* Program Type */}
            <div className="p-5 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Sumber Dana</p>
                <p className="text-sm font-bold text-stone-850 mt-0.5">{program.jenis_pelatihan}</p>
              </div>
            </div>

            {/* Quota */}
            <div className="p-5 flex items-start gap-3">
              <Users className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Kapasitas Kelas</p>
                <p className="text-sm font-bold text-stone-850 mt-0.5">{program.kuota} Peserta</p>
              </div>
            </div>

            {/* Period */}
            <div className="p-5 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Periode Pelaksanaan</p>
                <p className="text-sm font-bold text-stone-850 mt-0.5">
                  {program.tanggal_mulai} s/d {program.tanggal_selesai}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trainees List Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-stone-150 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-stone-900">Daftar Peserta Kelas</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-100">
                Terdaftar: {program.peserta?.length || 0} / {program.kuota}
              </span>
              <button
                onClick={() => {
                  setSearchTrainee("");
                  setShowAddModal(true);
                }}
                disabled={program.peserta?.length >= program.kuota}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Peserta
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-stone-150 bg-white">
            <table className="min-w-full divide-y divide-stone-150">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase w-12">#</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">NIK</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">Nama Lengkap</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase w-16">L/P</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase w-36">Status Peserta</th>
                  <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-stone-500 uppercase w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {program.peserta && program.peserta.length > 0 ? (
                  program.peserta.map((p, index) => (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="px-4 py-2.5 font-medium text-stone-500">{index + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-stone-600">{p.tenaga_kerja?.nik || "-"}</td>
                      <td className="px-4 py-2.5 text-stone-900 font-medium">
                        {p.tenaga_kerja?.nama}
                        <p className="text-xs text-stone-400 font-normal">{p.tenaga_kerja?.email}</p>
                      </td>
                      <td className="px-4 py-2.5 text-stone-600">
                        {p.tenaga_kerja?.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={p.status_peserta}
                          onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                          className="border border-stone-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="lulus">Lulus</option>
                          <option value="tidak_lulus">Tidak Lulus</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => handleRemovePeserta(p.id, p.tenaga_kerja?.nama)}
                          className="text-stone-500 hover:text-red-650 transition-colors"
                          title="Hapus dari Pelatihan"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-stone-450 text-xs">
                      Tidak ada peserta terdaftar untuk kelas ini. Klik "+ Tambah Peserta" untuk mendaftarkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Note Info */}
          <div className="flex gap-2 p-3 bg-stone-50 border border-stone-200 rounded-lg mt-4 text-xs text-stone-500">
            <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
            <span>
              Perubahan status kelulusan peserta menjadi <strong>Lulus</strong> akan memudahkan integrasi ke <strong>Tracer Study</strong> pasca-pelatihan.
            </span>
          </div>
        </div>
      </div>

      {/* Modal Tambah Peserta */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-stone-900">Daftarkan Peserta Pelatihan</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-500 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTrainee}
                onChange={(e) => setSearchTrainee(e.target.value)}
                placeholder="Cari Tenaga Kerja berdasarkan Nama / NIK..."
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y border rounded-lg bg-stone-50/50">
              {filteredTrainees.length > 0 ? (
                filteredTrainees.map((tk) => (
                  <div key={tk.id} className="p-3 flex items-center justify-between bg-white hover:bg-stone-50">
                    <div>
                      <p className="text-sm font-semibold text-stone-850">{tk.nama}</p>
                      <p className="text-xs text-stone-450">NIK: {tk.nik} | Pend: {tk.pendidikan_terakhir}</p>
                    </div>
                    <button
                      onClick={() => handleAddPeserta(tk.id)}
                      disabled={addingTrainee}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" /> Tambah
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-stone-450 text-xs">
                  Tidak ada data tenaga kerja yang dapat didaftarkan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
