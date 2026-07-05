import { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BadgeCheck,
  BookOpen,
  Users,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  Save,
  X,
  Shield,
  Calendar,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { authAPI } from "../../../services/api";

export default function Profile() {
  const [profile, setProfile] = useState({
    nama_lpk: "",
    email: "",
    kontak: "",
    alamat: "",
    bidang_keahlian: "",
    status_aktif: "Aktif",
    totalPelatihan: 0,
    totalPeserta: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lpkId, setLpkId] = useState(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      setPasswordLoading(false);
      return;
    }

    try {
      await authAPI.changePassword(passwordForm);
      setPasswordSuccess("Password berhasil diubah!");
      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirmation: ""
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Gagal mengubah password. Periksa kembali password lama Anda.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setEditError('');
    setEditSuccess('');
  };

  const submitEditProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      await authAPI.updateLpkProfile(editForm);
      setEditSuccess('Profil berhasil diperbarui!');
      setProfile((prev) => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    authAPI.getCurrentUser()
      .then((res) => {
        const user = res.data.user;
        const lpk = user?.lpk;

        // Hitung total pelatihan dan peserta secara dinamis
        const totalPelatihan = lpk?.pelatihan?.length || 0;
        const totalPeserta = lpk?.pelatihan?.reduce((acc, curr) => acc + (curr.peserta?.length || 0), 0);

        setProfile({
          nama_lpk: lpk?.nama_lpk || user?.nama || "-",
          email: lpk?.email || user?.email || "-",
          kontak: lpk?.kontak || "-",
          alamat: lpk?.alamat || "-",
          bidang_keahlian: lpk?.bidang_keahlian || "-",
          status_aktif: lpk?.status_aktif ? "Aktif" : "Tidak Aktif",
          totalPelatihan,
          totalPeserta,
        });
        setLpkId(lpk?.id || null);
        setEditForm({
          nama_lpk: lpk?.nama_lpk || "",
          email: lpk?.email || user?.email || "",
          kontak: lpk?.kontak || "",
          alamat: lpk?.alamat || "",
          bidang_keahlian: lpk?.bidang_keahlian || "",
        });
      })
      .catch((err) => {
        console.error("Gagal memuat profil LPK:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-stone-500">Memuat profil lembaga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PROFILE HEADER CARD                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Cover photo - Perpustakaan Soeman HS, Riau */}
        <div className="h-36 sm:h-44 relative overflow-hidden">
          <img
            src="/riau-bg.jpg"
            alt="Perpustakaan Soeman HS, Riau"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Blue gradient overlay top to bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-800/70 via-blue-600/40 to-blue-500/60" />
        </div>

        {/* Avatar + Info */}
        <div className="relative px-8 pb-6 -mt-14 z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center flex-shrink-0">
              <Building2 className="w-9 h-9 text-blue-600" />
            </div>

            {/* Name & Meta */}
            <div className="flex-1 pt-1 sm:pt-0 sm:pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {profile.nama_lpk}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                  profile.status_aktif === 'Aktif'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    profile.status_aktif === 'Aktif' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {profile.status_aktif}
                </span>
              </div>
              <p className="text-stone-500 text-sm mt-1">Lembaga Pelatihan Kerja</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STATISTICS CARDS                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Pelatihan */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Pelatihan</p>
              <p className="text-3xl font-bold text-stone-900 mt-1">{profile.totalPelatihan}</p>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Program pelatihan aktif
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Peserta */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Peserta</p>
              <p className="text-3xl font-bold text-stone-900 mt-1">{profile.totalPeserta}</p>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Peserta terdaftar
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TWO-COLUMN LAYOUT: INFORMASI & UBAH SANDI                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── INFORMASI LPK (2/3 width) ─── */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Card Header */}
          <div className="border-b border-stone-100 px-6 py-4 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Building2 className="text-blue-600 w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900 text-sm">Informasi Lembaga</h2>
                <p className="text-xs text-stone-400">Detail profil LPK Anda</p>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => { setIsEditing(true); setEditError(''); setEditSuccess(''); }}
                className="flex items-center gap-1.5 text-xs bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition font-medium shadow-sm"
              >
                <Pencil className="w-3 h-3" /> Edit Profil
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <Pencil className="w-3 h-3" /> Mode Edit
              </span>
            )}
          </div>

          {/* Card Body */}
          <div className="p-6">
            {/* Pesan sukses */}
            {editSuccess && !isEditing && (
              <div className="mb-5 flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
                <BadgeCheck className="w-4 h-4 shrink-0" /> {editSuccess}
              </div>
            )}

            {!isEditing ? (
              /* ── MODE TAMPIL ── */
              <div className="space-y-1">
                {/* Info row component style */}
                {[
                  { icon: Building2, label: "Nama LPK", value: profile.nama_lpk, color: "blue" },
                  { icon: Mail, label: "Email", value: profile.email, color: "blue" },
                  { icon: Phone, label: "Kontak", value: profile.kontak, color: "blue" },
                  { icon: Briefcase, label: "Bidang Keahlian", value: profile.bidang_keahlian, color: "blue" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-stone-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-lg bg-${item.color}-50 flex items-center justify-center flex-shrink-0 group-hover:bg-${item.color}-100 transition-colors`}>
                        <Icon className={`w-4 h-4 text-${item.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-400 font-medium">{item.label}</p>
                        <p className="text-sm font-semibold text-stone-800 truncate mt-0.5">{item.value || '-'}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Status */}
                <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg hover:bg-stone-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <BadgeCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-400 font-medium">Status</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      profile.status_aktif === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        profile.status_aktif === 'Aktif' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {profile.status_aktif}
                    </span>
                  </div>
                </div>

                {/* Alamat – full width with subtle separator */}
                <div className="mt-2 pt-3 border-t border-stone-100">
                  <div className="flex items-start gap-4 px-4 py-3.5 rounded-lg hover:bg-stone-50 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-400 font-medium">Alamat Lengkap</p>
                      <p className="text-sm font-medium text-stone-700 mt-0.5 leading-relaxed">{profile.alamat || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ── MODE EDIT ── */
              <form onSubmit={submitEditProfile} className="space-y-5">
                {editError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                    <X className="w-4 h-4 shrink-0" /> {editError}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      Nama LPK <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="nama_lpk" value={editForm.nama_lpk}
                      onChange={handleEditChange} required
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      type="email" name="email" value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Kontak (No HP/Telp)</label>
                    <input
                      type="text" name="kontak" value={editForm.kontak}
                      onChange={handleEditChange}
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Bidang Keahlian</label>
                    <input
                      type="text" name="bidang_keahlian" value={editForm.bidang_keahlian}
                      onChange={handleEditChange}
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Alamat</label>
                    <textarea
                      name="alamat" value={editForm.alamat}
                      onChange={handleEditChange} rows={3}
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-stone-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="submit" disabled={editLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setEditError(''); }}
                    className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-50 transition"
                  >
                    <X className="w-4 h-4" /> Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ─── UBAH KATA SANDI (1/3 width) ─── */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden h-fit">
          {/* Card Header */}
          <div className="border-b border-stone-100 px-6 py-4 bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="text-blue-600 w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900 text-sm">Keamanan Akun</h2>
                <p className="text-xs text-stone-400">Ubah kata sandi</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <form onSubmit={submitPasswordChange} className="space-y-4">
              
              {passwordError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100">
                  <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}
              
              {passwordSuccess && (
                <div className="flex items-start gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-xs border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Kata Sandi Lama */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Kata Sandi Lama
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-stone-400" />
                  </div>
                  <input
                    type={showPassword.old ? "text" : "password"}
                    name="old_password"
                    value={passwordForm.old_password}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan password lama"
                    className="pl-9 w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, old: !showPassword.old})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword.old ? <EyeOff className="h-3.5 w-3.5"/> : <Eye className="h-3.5 w-3.5"/>}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-stone-400" />
                  </div>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan password baru"
                    className="pl-9 w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword.new ? <EyeOff className="h-3.5 w-3.5"/> : <Eye className="h-3.5 w-3.5"/>}
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Minimal 6 karakter
                </p>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Konfirmasi Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-stone-400" />
                  </div>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="new_password_confirmation"
                    value={passwordForm.new_password_confirmation}
                    onChange={handlePasswordChange}
                    placeholder="Ulangi password baru"
                    className="pl-9 w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-stone-50 focus:bg-white transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword.confirm ? <EyeOff className="h-3.5 w-3.5"/> : <Eye className="h-3.5 w-3.5"/>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm mt-2 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {passwordLoading ? "Menyimpan..." : "Ubah Kata Sandi"}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}