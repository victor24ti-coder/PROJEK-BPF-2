import { useEffect, useState } from 'react';
import { pemaganganAPI, tenagaKerjaAPI, perusahaanAPI } from '../../services/api';

const emptyForm = {
  tenaga_kerja_id: '',
  perusahaan_id: '',
  bidang: '',
  durasi: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  status: 'berjalan',
};

export default function PemaganganPage() {
  const [data, setData]                 = useState([]);
  const [trainees, setTrainees]         = useState([]);
  const [companies, setCompanies]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [errors, setErrors]             = useState({});
  const [saving, setSaving]             = useState(false);

  // Custom delete state
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await pemaganganAPI.getAll();
      setData(res.data.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const tkRes = await tenagaKerjaAPI.getAll('false');
      setTrainees(tkRes.data.data ?? []);

      const pRes = await perusahaanAPI.getAll();
      setCompanies(pRes.data.data.data ?? pRes.data.data ?? []);
    } catch (e) {
      console.error('Failed to load form options', e);
    }
  };

  useEffect(() => {
    fetchData();
    loadOptions();
  }, []);

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await pemaganganAPI.getById(id);
      setForm(res.data.data);
      setEditId(id);
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
      await pemaganganAPI.delete(deleteId);
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
      if (editId) {
        await pemaganganAPI.update(editId, form);
      } else {
        await pemaganganAPI.create(form);
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

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Pemagangan Kerja</h2>
        <button
          onClick={openTambah}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          + Tambah Pemagangan
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Nama Tenaga Kerja</th>
              <th className="px-4 py-3">Perusahaan Mitra</th>
              <th className="px-4 py-3">Bidang</th>
              <th className="px-4 py-3">Durasi</th>
              <th className="px-4 py-3">Tanggal Mulai</th>
              <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {item.tenaga_kerja?.nama ?? `ID: ${item.tenaga_kerja_id}`}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {item.perusahaan?.nama_perusahaan ?? `ID: ${item.perusahaan_id}`}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{item.bidang ?? '-'}</td>
                  <td className="px-4 py-3 text-stone-600">{item.durasi ?? '-'}</td>
                  <td className="px-4 py-3 text-stone-600">{item.tanggal_mulai ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'berjalan' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status === 'berjalan' ? 'Berjalan' : 'Selesai'}
                    </span>
                  </td>
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">
              {editId ? 'Edit Pemagangan' : 'Tambah Pemagangan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-stone-700 mb-1">Tenaga Kerja</label>
                <select
                  name="tenaga_kerja_id"
                  value={form.tenaga_kerja_id}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                    errors.tenaga_kerja_id ? 'border-red-400' : 'border-stone-300'
                  }`}
                >
                  <option value="">Pilih Tenaga Kerja</option>
                  {trainees.map(t => (
                    <option key={t.id} value={t.id}>{t.nama} (NIK: {t.nik})</option>
                  ))}
                </select>
                {errors.tenaga_kerja_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.tenaga_kerja_id[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">Perusahaan Mitra</label>
                <select
                  name="perusahaan_id"
                  value={form.perusahaan_id}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${
                    errors.perusahaan_id ? 'border-red-400' : 'border-stone-300'
                  }`}
                >
                  <option value="">Pilih Perusahaan</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_perusahaan}</option>
                  ))}
                </select>
                {errors.perusahaan_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.perusahaan_id[0]}</p>
                )}
              </div>

              {[
                { name: 'bidang',         label: 'Bidang',         type: 'text' },
                { name: 'durasi',         label: 'Durasi',         type: 'text' },
                { name: 'tanggal_mulai',   label: 'Tanggal Mulai',   type: 'date' },
                { name: 'tanggal_selesai', label: 'Tanggal Selesai', type: 'date' },
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
                <label className="block text-sm text-stone-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="berjalan">Berjalan</option>
                  <option value="selesai">Selesai</option>
                </select>
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
              Apakah Anda yakin ingin menghapus data pemagangan ini? Tindakan ini tidak dapat dibatalkan.
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
