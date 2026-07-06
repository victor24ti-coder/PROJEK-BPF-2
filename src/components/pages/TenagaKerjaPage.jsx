import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import API, { tenagaKerjaAPI } from '../../services/api';

const emptyForm = {
  nik: '',
  nama: '',
  email: '',
  no_hp: '',
  jenis_kelamin: '',
  tanggal_lahir: '',
  alamat: '',
  pendidikan_terakhir: '',
  status_pekerjaan: '',
};

export default function TenagaKerjaPage() {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [file, setFile]         = useState(null);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  // Pagination state
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ current_page: 1, last_page: 1, total: 0 });

  // Detail state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Custom delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNama, setDeleteNama] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchData = async (keyword = '', pg = page) => {
    setLoading(true);
    try {
      const res = await tenagaKerjaAPI.getAll('true', keyword, pg);
      const payload = res.data.data;
      setData(payload.data ?? []);
      setMeta({
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
      });
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(search, page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(search, 1);
  };

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setFile(null);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await tenagaKerjaAPI.getById(id);
      setForm(res.data.data);
      setEditId(id);
      setFile(null);
      setErrors({});
      setShowModal(true);
    } catch {
      alert('Gagal memuat data');
    }
  };

  const openDetail = (item) => {
    setDetailData(item);
    setShowDetailModal(true);
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
      await tenagaKerjaAPI.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteNama('');
      fetchData(search);
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
      const isMultipart = file !== null;

      if (editId) {
        if (isMultipart) {
          const formData = new FormData();
          formData.append('_method', 'PUT');
          Object.keys(form).forEach(key => {
            if (key !== 'foto') {
              formData.append(key, form[key] ?? '');
            }
          });
          formData.append('foto', file);

          await API.post(`/tenaga-kerja/${editId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await tenagaKerjaAPI.update(editId, form);
        }
      } else {
        if (isMultipart) {
          const formData = new FormData();
          Object.keys(form).forEach(key => {
            formData.append(key, form[key] ?? '');
          });
          formData.append('foto', file);

          await API.post('/tenaga-kerja', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await tenagaKerjaAPI.create(form);
        }
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Tenaga Kerja</h2>
        <button
          onClick={openTambah}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          + Tambah Tenaga Kerja
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari nama, NIK, email..."
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
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Nama / NIK</th>
              <th className="px-4 py-3">Email / Kontak</th>
              <th className="px-4 py-3">Pendidikan</th>
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
                  <td className="px-4 py-3 text-stone-400">
                    {(meta.current_page - 1) * 10 + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    {item.foto ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${item.foto}`}
                        alt={item.nama}
                        className="w-10 h-10 object-cover rounded-full border border-stone-200"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Foto'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-stone-100 text-stone-400 flex items-center justify-center rounded-full text-xs border border-stone-200 font-semibold">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800">{item.nama}</div>
                    <div className="text-stone-400 text-xs">NIK: {item.nik}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <div>{item.email ?? '-'}</div>
                    <div className="text-stone-400 text-xs">{item.no_hp ?? '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{item.pendidikan_terakhir ?? '-'}</td>
                  <td className="px-4 py-3 text-stone-600">{item.status_pekerjaan ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openDetail(item)}
                        className="text-stone-600 hover:text-blue-600 hover:underline text-sm"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => openEdit(item.id)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama)}
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

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-stone-150 flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Halaman {meta.current_page} dari {meta.last_page} (Total: {meta.total} data)
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

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">
              {editId ? 'Edit Tenaga Kerja' : 'Tambah Tenaga Kerja'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { name: 'nik',   label: 'NIK',   type: 'text' },
                { name: 'nama',  label: 'Nama',  type: 'text' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'no_hp', label: 'No HP', type: 'text' },
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
                <label className="block text-sm text-stone-700 mb-1">Jenis Kelamin</label>
                <select
                  name="jenis_kelamin"
                  value={form.jenis_kelamin}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={form.tanggal_lahir ?? ''}
                  onChange={handleChange}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  name="pendidikan_terakhir"
                  value={form.pendidikan_terakhir ?? ''}
                  onChange={handleChange}
                  placeholder="Misal: SMK, D3, S1"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">Status Pekerjaan</label>
                <input
                  type="text"
                  name="status_pekerjaan"
                  value={form.status_pekerjaan ?? ''}
                  onChange={handleChange}
                  placeholder="Misal: Belum Bekerja, Bekerja"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">Alamat</label>
                <textarea
                  name="alamat"
                  value={form.alamat ?? ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-700 mb-1">Foto Profile</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
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

      {/* Modal Detail */}
      {showDetailModal && detailData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="text-xl font-bold text-stone-800">Detail Tenaga Kerja</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-stone-400 hover:text-stone-600">
                &times;
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                {detailData.foto ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${detailData.foto}`}
                    alt={detailData.nama}
                    className="w-40 h-40 object-cover rounded-2xl border-4 border-stone-100 shadow-sm"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=Foto'; }}
                  />
                ) : (
                  <div className="w-40 h-40 bg-stone-100 text-stone-400 flex items-center justify-center rounded-2xl border-4 border-stone-50 font-semibold shadow-sm">
                    Tanpa Foto
                  </div>
                )}
                <div className="mt-4 text-center">
                  <h4 className="text-lg font-bold text-stone-900">{detailData.nama}</h4>
                  <p className="text-sm font-medium text-stone-500">NIK: {detailData.nik}</p>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 bg-stone-50 p-5 rounded-xl border border-stone-100">
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-stone-800 font-medium mt-1">{detailData.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">No HP</p>
                  <p className="text-sm text-stone-800 font-medium mt-1">{detailData.no_hp || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Jenis Kelamin</p>
                  <p className="text-sm text-stone-800 font-medium mt-1">{detailData.jenis_kelamin === 'L' ? 'Laki-laki' : detailData.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tanggal Lahir</p>
                  <p className="text-sm text-stone-800 font-medium mt-1">{detailData.tanggal_lahir || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pendidikan Terakhir</p>
                  <p className="text-sm text-stone-800 font-medium mt-1">{detailData.pendidikan_terakhir || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status Pekerjaan</p>
                  <p className="text-sm text-stone-800 font-medium mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {detailData.status_pekerjaan || '-'}
                    </span>
                  </p>
                </div>
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-stone-200">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Alamat Lengkap</p>
                  <p className="text-sm text-stone-800 font-medium mt-1 leading-relaxed">{detailData.alamat || '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-stone-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-stone-600 mb-4">
              Apakah Anda yakin ingin menghapus tenaga kerja <strong>{deleteNama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
