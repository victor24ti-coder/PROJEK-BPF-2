import { useEffect, useState } from 'react';
import { perusahaanAPI } from '../../services/api';

const emptyForm = {
  nama_perusahaan: '',
  bidang_usaha: '',
  alamat: '',
  kontak: '',
  email: '',
};

export default function PerusahaanPage() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  const fetchData = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await perusahaanAPI.getAll(keyword);
      setData(res.data.data.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await perusahaanAPI.getById(id);
      setForm(res.data.data);
      setEditId(id);
      setErrors({});
      setShowModal(true);
    } catch {
      alert('Gagal memuat data');
    }
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus perusahaan "${nama}"?`)) return;
    try {
      await perusahaanAPI.delete(id);
      fetchData(search);
    } catch {
      alert('Gagal menghapus data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editId) {
        await perusahaanAPI.update(editId, form);
      } else {
        await perusahaanAPI.create(form);
      }
      setShowModal(false);
      fetchData(search);
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
        <h2 className="text-2xl font-bold text-stone-900">Perusahaan Mitra</h2>
        <button
          onClick={openTambah}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          + Tambah Perusahaan
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari nama, bidang usaha, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-300 rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="border border-stone-300 bg-stone-50 px-4 py-2 rounded-lg text-sm hover:bg-stone-100 transition"
        >
          Cari
        </button>
      </form>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Nama Perusahaan</th>
              <th className="px-4 py-3">Bidang Usaha</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-stone-400">
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-stone-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">{item.nama_perusahaan}</td>
                  <td className="px-4 py-3 text-stone-600">{item.bidang_usaha}</td>
                  <td className="px-4 py-3 text-stone-600">{item.kontak}</td>
                  <td className="px-4 py-3 text-stone-600">{item.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(item.id)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama_perusahaan)}
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
              {editId ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { name: 'nama_perusahaan', label: 'Nama Perusahaan', type: 'text' },
                { name: 'bidang_usaha',    label: 'Bidang Usaha',    type: 'text' },
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
    </div>
  );
}