import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import logoDisnaker from '../../assets/logodisnaker.png';

// ── Warna Brand Disnaker ──────────────────────────────────────────────────────
const BRAND = {
  blue: '#1E5CA8',
  blueDark: '#154080',
  blueLight: '#EBF2FB',
  green: '#6BBE45',
  greenDark: '#4E9932',
  greenLight: '#EEF8E8',
  cyan: '#29ABE2',
  gray: '#333333',
};

const emptyForm = {
  nama: '',
  email: '',
  password: '',
  role: 'staf',
  status: 'aktif',
};

// ─── Account Card Component ───────────────────────────────────────────────────
function AccountCard({ user, creatorName, cardRef }) {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'staf': return 'Staf Disnaker';
      case 'lpk': return 'LPK (Lembaga Pelatihan Kerja)';
      default: return role;
    }
  };

  return (
    <div
      ref={cardRef}
      id="account-card-printable"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        background: '#ffffff',
        width: '480px',
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `2px solid ${BRAND.blue}`,
        boxShadow: '0 4px 24px rgba(30,92,168,0.15)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BRAND.blueDark} 0%, ${BRAND.blue} 60%, ${BRAND.cyan} 100%)`,
          padding: '20px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <img
          src={logoDisnaker}
          alt="Logo Disnaker"
          style={{ width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0, filter: 'brightness(0) invert(1)' }}
          crossOrigin="anonymous"
        />
        <div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>
            Dinas Tenaga Kerja &amp; Transmigrasi · Provinsi Riau
          </div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px', lineHeight: 1.2 }}>
            SIMANDAT DISNAKERTRANS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', marginTop: '2px' }}>
            Sistem Informasi Manajemen Data Tenaga Kerja
          </div>
        </div>
      </div>

      {/* ── Sub-header label ── */}
      <div
        style={{
          background: BRAND.green,
          padding: '7px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
        </svg>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Kartu Informasi Akun
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '20px 24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', color: BRAND.gray }}>
          <tbody>
            <CardRow label="Nama Lengkap" value={user.nama} bold />
            <CardRow label="Role / Jabatan" value={formatRole(user.role)} colored />
            <CardRow label="Alamat Email" value={user.email} />
            <CardRow label="Password Awal" value={user.plainPassword} mono />
            <CardRow label="Status Akun" value={user.status === 'aktif' ? '✔ Aktif' : '✘ Nonaktif'} />
            <CardRow label="Dibuat Oleh" value={creatorName || 'Administrator'} />
            <CardRow label="Tanggal Dibuat" value={today} />
          </tbody>
        </table>

        {/* Divider */}
        <div style={{
          margin: '16px 0 14px',
          height: '1px',
          background: `linear-gradient(to right, ${BRAND.blue}, ${BRAND.green})`,
          opacity: 0.3,
        }} />

        {/* Notice */}
        <div style={{
          background: BRAND.blueLight,
          border: `1px solid #c5d9f0`,
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '11px',
          color: BRAND.blue,
          lineHeight: 1.7,
          textAlign: 'center',
        }}>
          <strong>⚠ Penting:</strong> Harap segera login dan ubah password Anda.
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        background: BRAND.blueDark,
        padding: '8px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '9px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Dokumen Rahasia · Jaga Kerahasiaan Akun
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.blue, display: 'inline-block' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.green, display: 'inline-block' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.cyan, display: 'inline-block' }} />
        </div>
      </div>
    </div>
  );
}

function CardRow({ label, value, bold, colored, mono }) {
  return (
    <tr>
      <td style={{
        padding: '7px 0',
        verticalAlign: 'top',
        color: '#6b7280',
        width: '130px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
      }}>
        {label}
      </td>
      <td style={{ padding: '7px 6px', verticalAlign: 'top', color: '#9ca3af', fontSize: '11px' }}>:</td>
      <td style={{
        padding: '7px 0',
        verticalAlign: 'top',
        fontWeight: bold ? '700' : mono ? '600' : '500',
        color: colored ? BRAND.blue : bold ? BRAND.gray : '#374151',
        fontSize: mono ? '13px' : '13px',
        fontFamily: mono ? "'Courier New', Courier, monospace" : 'inherit',
        letterSpacing: mono ? '1.5px' : 'inherit',
      }}>
        {value}
      </td>
    </tr>
  );
}

// ─── Info Row helper (ringkasan modal) ───────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-stone-500 w-20 flex-shrink-0 text-xs">{label}</span>
      <span className="text-stone-300 text-xs">:</span>
      <span className="font-semibold text-stone-800 text-sm">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const [deleteId, setDeleteId] = useState(null);
  const [deleteNama, setDeleteNama] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Account Card state
  const [createdUser, setCreatedUser] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const cardRef = useRef(null);

  const fetchData = async (kw = search, role = roleFilter, pg = page) => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll(kw, role, pg);
      const payload = res.data.data;
      setData(payload.data ?? []);
      setMeta({
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
      });
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(search, roleFilter, page); }, [page]);

  const openTambah = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await usersAPI.getById(id);
      const u = res.data.data;
      setForm({ nama: u.nama ?? '', email: u.email ?? '', password: '', role: u.role ?? 'staf', status: u.status ?? 'aktif' });
      setEditId(id);
      setErrors({});
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat data pengguna');
    }
  };

  const handleDelete = (id, nama) => {
    if (id === currentUser?.id) { alert('Anda tidak dapat menghapus akun Anda sendiri.'); return; }
    setDeleteId(id);
    setDeleteNama(nama);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await usersAPI.delete(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteNama('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pengguna');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const newErrors = {};
    if (!form.nama) newErrors.nama = ['Nama wajib diisi'];
    if (!form.email) newErrors.email = ['Email wajib diisi'];
    if (!editId && !form.password) newErrors.password = ['Password wajib diisi'];
    if (!editId && form.password && form.password.length < 6) newErrors.password = ['Password minimal 6 karakter'];

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setSaving(false); return; }

    try {
      const submitData = { ...form };
      const plainPassword = form.password;
      if (editId && !submitData.password) delete submitData.password;

      if (editId) {
        await usersAPI.update(editId, submitData);
        setShowModal(false);
        fetchData();
      } else {
        await usersAPI.create(submitData);
        setCreatedUser({ nama: form.nama, email: form.email, role: form.role, status: form.status, plainPassword });
        setShowModal(false);
        setShowCardModal(true);
        setShowCardPreview(false);
        fetchData();
      }
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
      else alert(err.response?.data?.message || 'Terjadi kesalahan, coba lagi');
    } finally {
      setSaving(false);
    }
  };

  // ── Download PDF menggunakan html2canvas + jsPDF ──────────────────────────
  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    setDownloadingPDF(true);
    try {
      await new Promise(r => setTimeout(r, 200)); // beri waktu render
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min((pdfW - 20) / imgW, (pdfH - 20) / imgH);
      const finalW = imgW * ratio;
      const finalH = imgH * ratio;
      const x = (pdfW - finalW) / 2;
      const y = (pdfH - finalH) / 2;
      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      const safeName = (createdUser?.nama || 'akun').replace(/\s+/g, '_').toLowerCase();
      pdf.save(`account_card_${safeName}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
      alert('Gagal membuat PDF. Coba lagi.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Search/filter handler — reset to page 1 when filters change
  const handleFilterChange = (newSearch, newRole) => {
    setPage(1);
    fetchData(newSearch, newRole, 1);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return { bg: '#EBF2FB', text: BRAND.blue, border: '#c5d9f0' };
      case 'staf': return { bg: '#EEF8E8', text: BRAND.greenDark, border: '#c5e8ad' };
      case 'lpk': return { bg: '#E8F7FD', text: '#1a7fa8', border: '#aadcf0' };
      default: return { bg: '#f5f5f5', text: '#555', border: '#ddd' };
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'staf': return 'Staf Disnaker';
      case 'lpk': return 'LPK';
      default: return role;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Manajemen Pengguna</h2>
          <p className="text-sm text-stone-500 mt-1">Kelola data login pengguna sistem (Admin, Staf, dan LPK)</p>
        </div>
        <button
          onClick={openTambah}
          style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})` }}
          className="text-white font-medium px-4 py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 hover:opacity-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); handleFilterChange(e.target.value, roleFilter); }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-stone-300 rounded-lg outline-none focus:ring-2"
            style={{ '--tw-ring-color': BRAND.blueLight }}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); handleFilterChange(search, e.target.value); }}
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg outline-none bg-white"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="staf">Staf Disnaker</option>
            <option value="lpk">LPK</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Nama</th>
                <th className="px-6 py-3.5 font-semibold">Email</th>
                <th className="px-6 py-3.5 font-semibold text-center">Role</th>
                <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-stone-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: BRAND.blue, borderTopColor: 'transparent' }} />
                    <span>Memuat data pengguna...</span>
                  </div>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-stone-400">Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                data.map((item) => {
                  const badge = getRoleBadge(item.role);
                  return (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-800">{item.nama}</div>
                        {item.id === currentUser?.id && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded"
                            style={{ background: BRAND.blueLight, color: BRAND.blue, border: `1px solid #c5d9f0` }}>
                            Akun Anda
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-stone-600">{item.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold border"
                          style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
                          {formatRole(item.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
                          style={{ background: item.status === 'aktif' ? BRAND.green : '#f87171' }} />
                        <span className="text-stone-700 text-xs font-medium uppercase tracking-wider">
                          {item.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => openEdit(item.id)}
                            className="text-sm font-semibold hover:underline cursor-pointer"
                            style={{ color: BRAND.blue }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item.id, item.nama)}
                            disabled={item.id === currentUser?.id}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Halaman {meta.current_page} dari {meta.last_page}
              <span className="ml-2 text-stone-400">(Total: {meta.total} pengguna)</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page === 1}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page === meta.last_page}
                className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Tambah / Edit ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-stone-100">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between"
              style={{ background: BRAND.blueLight }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: BRAND.blueDark }}>
                  {editId ? 'Ubah Informasi Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: BRAND.blue }}>
                  {editId ? 'Perbarui data login pengguna' : 'Buat akun login baru untuk pengguna'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600 text-xl cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">Nama Lengkap</label>
                <input type="text" name="nama" value={form.nama} onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.nama ? 'border-red-400 bg-red-50/20' : 'border-stone-300'}`}
                />
                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama[0]}</p>}
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">Alamat Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="contoh@email.com"
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.email ? 'border-red-400 bg-red-50/20' : 'border-stone-300'}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
              </div>
              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
                  Password {editId && <span className="text-[10px] text-stone-400 font-normal lowercase">(kosongkan jika tidak diubah)</span>}
                </label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder={editId ? 'Masukkan password baru' : 'Masukkan password login'}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${errors.password ? 'border-red-400 bg-red-50/20' : 'border-stone-300'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
              </div>
              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">Role Akses</label>
                  <select name="role" value={form.role} onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-white">
                    <option value="admin">Admin</option>
                    <option value="staf">Staf Disnaker</option>
                    <option value="lpk">LPK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">Status Akun</label>
                  <select name="status" value={form.status} onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none bg-white">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              {/* Actions */}
              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} disabled={saving}
                  className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 text-stone-700 text-sm font-medium cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2 cursor-pointer shadow-sm hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.cyan})` }}>
                  {saving && <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />}
                  {saving ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Account Card ──────────────────────────────────────────────── */}
      {showCardModal && createdUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(6px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden border border-stone-100">

            {/* Success header */}
            <div style={{ background: `linear-gradient(135deg, ${BRAND.blueDark}, ${BRAND.blue} 60%, ${BRAND.cyan})` }}
              className="px-6 py-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-base">Akun Berhasil Dibuat!</div>
                <div className="text-white/70 text-xs mt-0.5">Account Card siap diunduh sebagai PDF</div>
              </div>
              <button onClick={() => setShowCardModal(false)} className="text-white/60 hover:text-white text-xl cursor-pointer leading-none">&times;</button>
            </div>

            <div className="p-5">
              {!showCardPreview ? (
                /* Ringkasan sebelum lihat kartu */
                <div className="space-y-4">
                  <div className="rounded-xl border p-4 space-y-2.5" style={{ background: BRAND.blueLight, borderColor: '#c5d9f0' }}>
                    <InfoRow label="Nama" value={createdUser.nama} />
                    <InfoRow label="Email" value={createdUser.email} />
                    <InfoRow label="Role" value={formatRole(createdUser.role)} />
                    <InfoRow label="Status" value={createdUser.status === 'aktif' ? '✅ Aktif' : '🔴 Nonaktif'} />
                  </div>

                  <p className="text-xs text-stone-500 text-center leading-relaxed">
                    Unduh Account Card dan serahkan kepada pengguna sebagai bukti pembuatan akun.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setShowCardPreview(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer border-2"
                      style={{ borderColor: BRAND.blue, color: BRAND.blue, background: 'white' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Lihat Account Card
                    </button>
                    <button
                      onClick={() => { setShowCardPreview(true); setTimeout(handleDownloadPDF, 400); }}
                      disabled={downloadingPDF}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 shadow-sm disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.green})` }}
                    >
                      {downloadingPDF ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      {downloadingPDF ? 'Membuat PDF...' : 'Download PDF'}
                    </button>
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button onClick={() => setShowCardModal(false)}
                      className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer">
                      Tutup (tanpa unduh)
                    </button>
                  </div>
                </div>
              ) : (
                /* Preview + Download */
                <div className="space-y-4">
                  {/* Render kartu di sini — direferensikan oleh cardRef */}
                  <div className="overflow-auto max-h-[60vh] pb-1">
                    <AccountCard user={createdUser} creatorName={currentUser?.nama} cardRef={cardRef} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => setShowCardPreview(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-300 text-stone-600 hover:bg-stone-50 rounded-xl text-sm font-medium cursor-pointer">
                      ← Kembali
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 shadow-sm disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.green})` }}
                    >
                      {downloadingPDF ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      {downloadingPDF ? 'Membuat PDF...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Hapus ─────────────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden border border-stone-100">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-stone-800 text-center mb-2">Hapus Akun Pengguna</h3>
              <p className="text-sm text-stone-500 text-center leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong className="text-stone-800">"{deleteNama}"</strong>? Pengguna tidak akan bisa login lagi.
              </p>
            </div>
            <div className="px-6 py-4 bg-stone-50 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} disabled={saving}
                className="px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 text-stone-700 text-sm font-medium cursor-pointer">
                Batal
              </button>
              <button type="button" onClick={confirmDelete} disabled={saving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 flex items-center gap-2 cursor-pointer shadow-sm">
                {saving && <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />}
                {saving ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
