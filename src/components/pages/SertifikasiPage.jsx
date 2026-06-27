import { useEffect, useState } from 'react';
import API, { sertifikasiAPI, pesertaPelatihanAPI } from '../../services/api';

const emptyForm = {
  peserta_pelatihan_id: '',
  nama_sertifikasi: '',
  lembaga_sertifikasi: '',
  nomor_sertifikat: '',
  tanggal_terbit: '',
  masa_berlaku: '',
  status_sertifikat: 'aktif',
};

export default function SertifikasiPage() {
  const [data, setData]                 = useState([]);
  const [pesertas, setPesertas]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [file, setFile]                 = useState(null);
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);

  // Custom delete state
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await sertifikasiAPI.getAll('paginate=false');
      setData(res.data.data?.data ?? res.data.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPesertas = async () => {
    try {
      const pRes = await pesertaPelatihanAPI.getAll('paginate=false');
      const payload = pRes.data.data;
      setPesertas(Array.isArray(payload) ? payload : (payload?.data ?? []));
    } catch (e) {
      console.error('Failed to load participants options', e);
    }
  };

  useEffect(() => {
    fetchData();
    loadPesertas();
  }, []);

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setFile(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await sertifikasiAPI.getById(id);
      setForm({
        peserta_pelatihan_id: res.data.data.peserta_pelatihan_id ?? '',
        nama_sertifikasi: res.data.data.nama_sertifikasi ?? '',
        lembaga_sertifikasi: res.data.data.lembaga_sertifikasi ?? '',
        nomor_sertifikat: res.data.data.nomor_sertifikat ?? '',
        tanggal_terbit: res.data.data.tanggal_terbit ?? '',
        masa_berlaku: res.data.data.masa_berlaku ?? '',
        status_sertifikat: res.data.data.status_sertifikat ?? 'aktif',
      });
      setEditId(id);
      setFile(null);
      setErrors({});
      setShowModal(true);
    } catch {
      alert('Gagal memuat data');
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await sertifikasiAPI.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch {
      alert('Gagal menghapus data');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key] ?? '');
      });

      if (file) {
        formData.append('file_sertifikat', file);
      }

      if (editId) {
        formData.append('_method', 'PUT');
        await API.post(`/sertifikasi/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/sertifikasi', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        alert('Terjadi kesalahan, coba lagi');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrors({ ...errors, file_sertifikat: null });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Sertifikasi Profesi</h2>
        <button
          onClick={openTambah}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          + Tambah Sertifikasi
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Sertifikat</th>
              <th className="px-4 py-3">Nama Tenaga Kerja</th>
              <th className="px-4 py-3">Nama Sertifikasi</th>
              <th className="px-4 py-3">Lembaga Sertifikasi</th>
              <th className="px-4 py-3">Nomor Sertifikat</th>
              <th className="px-4 py-3">Tanggal Terbit</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-stone-400">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-stone-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    {item.file_sertifikat ? (
                      <a
                        href={`http://127.0.0.1:8000/storage/${item.file_sertifikat}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {item.peserta_pelatihan?.tenaga_kerja?.nama ?? `ID: ${item.peserta_pelatihan_id}`}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{item.nama_sertifikasi}</td>
                  <td className="px-4 py-3 text-stone-600">{item.lembaga_sertifikasi}</td>
                  <td className="px-4 py-3 text-stone-600">{item.nomor_sertifikat}</td>
                  <td className="px-4 py-3 text-stone-600">{item.tanggal_terbit}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(item.id)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">
              {editId ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-stone-700 mb-1">Peserta Pelatihan</label>
                <select
                  name="peserta_pelatihan_id"
                  value={form.peserta_pelatihan_id}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                    errors.peserta_pelatihan_id ? 'border-red-400' : 'border-stone-300'
                  }`}
                >
                  <option value="">Pilih Peserta Pelatihan</option>
                  {pesertas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.tenaga_kerja?.nama ?? '—'} — {p.pelatihan?.nama_pelatihan ?? '—'}
                    </option>
                  ))}
                </select>
                {errors.peserta_pelatihan_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.peserta_pelatihan_id[0]}</p>
                )}
              </div>

              {[
                { name: 'nama_sertifikasi',    label: 'Nama Sertifikasi',    type: 'text' },
                { name: 'lembaga_sertifikasi', label: 'Lembaga Sertifikasi', type: 'text' },
                { name: 'nomor_sertifikat',    label: 'Nomor Sertifikat',    type: 'text' },
                { name: 'tanggal_terbit',      label: 'Tanggal Terbit',      type: 'date' },
                { name: 'masa_berlaku',        label: 'Masa Berlaku',        type: 'date' },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-sm text-stone-700 mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name] ?? ''}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      errors[name] ? 'border-red-400' : 'border-stone-300'
                    }`}
                  />
                  {errors[name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[name][0]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm text-stone-700 mb-1">Status Sertifikat</label>
                <select
                  name="status_sertifikat"
                  value={form.status_sertifikat}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                    errors.status_sertifikat ? 'border-red-400' : 'border-stone-300'
                  }`}
                >
                  <option value="aktif">Aktif</option>
                  <option value="tidak_aktif">Tidak Aktif</option>
                </select>
                {errors.status_sertifikat && (
                  <p className="text-red-500 text-xs mt-1">{errors.status_sertifikat[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">
                  Berkas Sertifikat (PDF) {editId && <span className="text-stone-400 text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <input
                  type="file"
                  name="file_sertifikat"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className={`w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer ${
                    errors.file_sertifikat ? 'border-red-400' : 'border-stone-300'
                  }`}
                />
                {errors.file_sertifikat && (
                  <p className="text-red-500 text-xs mt-1">{errors.file_sertifikat[0]}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-stone-300 px-5 py-2 rounded-lg text-sm hover:bg-stone-50 transition"
                >
                  Batal
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
              Apakah Anda yakin ingin menghapus data sertifikasi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 font-medium"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus'}
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
