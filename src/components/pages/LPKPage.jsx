import { useEffect, useState } from 'react';
import { lpkAPI } from '../../services/api';

const emptyForm = {
  nama_lpk: '',
  alamat: '',
  bidang_keahlian: '',
  kontak: '',
  email: '',
  status_aktif: true,
};

export default function LPKPage() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  // Custom delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNama, setDeleteNama] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await lpkAPI.getAll('false');
      setData(res.data.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await lpkAPI.getById(id);
      setForm({
        ...res.data.data,
        status_aktif: res.data.data.status_aktif ? true : false
      });
      setEditId(id);
      setErrors({});
      setShowModal(true);
    } catch {
      alert('Gagal memuat data');
    }
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
      await lpkAPI.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteNama('');
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
        await lpkAPI.update(editId, form);
      } else {
        await lpkAPI.create(form);
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
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    setErrors({ ...errors, [e.target.name]: null });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Lembaga Pelatihan Kerja (LPK)</h2>
        <button
          onClick={openTambah}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          + Tambah LPK
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Nama LPK</th>
              <th className="px-4 py-3">Bidang Keahlian</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-stone-400">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-stone-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">{item.nama_lpk}</td>
                  <td className="px-4 py-3 text-stone-600">{item.bidang_keahlian ?? '-'}</td>
                  <td className="px-4 py-3 text-stone-600">{item.kontak ?? '-'}</td>
                  <td className="px-4 py-3 text-stone-600">{item.email ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status_aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status_aktif ? 'Aktif' : 'Nonaktif'}
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
                        onClick={() => handleDelete(item.id, item.nama_lpk)}
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
              {editId ? 'Edit LPK' : 'Tambah LPK'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { name: 'nama_lpk',        label: 'Nama LPK',        type: 'text' },
                { name: 'bidang_keahlian', label: 'Bidang Keahlian', type: 'text' },
                { name: 'kontak',          label: 'Kontak',          type: 'text' },
                { name: 'email',           label: 'Email',           type: 'email' },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-sm text-stone-700 mb-1">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
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
                <label className="block text-sm text-stone-700 mb-1">Alamat</label>
                <textarea
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    errors.alamat ? 'border-red-400' : 'border-stone-300'
                  }`}
                />
                {errors.alamat && (
                  <p className="text-red-500 text-xs mt-1">{errors.alamat[0]}</p>
                )}
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="status_aktif"
                  name="status_aktif"
                  checked={form.status_aktif}
                  onChange={handleChange}
                  className="rounded border-stone-300 focus:ring-blue-400"
                />
                <label htmlFor="status_aktif" className="text-sm text-stone-700 select-none">
                  LPK Aktif
                </label>
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
              Apakah Anda yakin ingin menghapus LPK <strong>{deleteNama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
                  setDeleteNama('');
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
