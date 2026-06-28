import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { User, Lock, Save, Eye, EyeOff } from "lucide-react";
import API from "../../../services/api";

export default function StafProfilePage() {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    nama:  user?.nama  ?? "",
    email: user?.email ?? "",
  });
  const [pwForm, setPwForm] = useState({
    password_lama:   "",
    password_baru:   "",
    konfirmasi: "",
  });
  const [showPw, setShowPw]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg]           = useState(null);
  const [pwMsg, setPwMsg]       = useState(null);
  const [errors, setErrors]     = useState({});
  const [pwErrors, setPwErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErrors({});
    try {
      await API.put("/profile", form);
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...form }));
      setMsg({ type: "success", text: "Profil berhasil diperbarui." });
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      } else {
        setMsg({ type: "error", text: "Gagal menyimpan profil." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSavePw = async (e) => {
    e.preventDefault();
    if (pwForm.password_baru !== pwForm.konfirmasi) {
      setPwErrors({ konfirmasi: ["Konfirmasi password tidak cocok."] });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    setPwErrors({});
    try {
      await API.put("/profile/password", {
        password_lama: pwForm.password_lama,
        password:      pwForm.password_baru,
      });
      setPwMsg({ type: "success", text: "Password berhasil diubah." });
      setPwForm({ password_lama: "", password_baru: "", konfirmasi: "" });
    } catch (err) {
      if (err.response?.status === 422) {
        setPwErrors(err.response.data.errors ?? {});
      } else {
        setPwMsg({ type: "error", text: "Gagal mengubah password." });
      }
    } finally {
      setSavingPw(false);
    }
  };

  const initials = (user?.nama ?? "S").charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Profil Saya</h1>
        <p className="text-sm text-stone-500 mt-1">Kelola informasi akun dan keamanan</p>
      </div>

      {/* Avatar & Info */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold select-none">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-stone-900 text-lg">{user?.nama ?? "-"}</p>
          <p className="text-sm text-stone-500">{user?.email ?? "-"}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
            {user?.role ?? "staf"}
          </span>
        </div>
      </div>

      {/* Form Profil */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-500" /> Informasi Profil
        </h3>
        <form onSubmit={handleSaveProfil} className="space-y-4">
          {msg && (
            <p className={`text-sm px-3 py-2 rounded-lg ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {msg.text}
            </p>
          )}
          {[
            { name: "nama",  label: "Nama Lengkap", type: "text" },
            { name: "email", label: "Email",        type: "email" },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="block text-sm text-stone-700 mb-1 font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors[name] ? "border-red-400" : "border-stone-300"}`}
              />
              {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name][0]}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </form>
      </div>

      {/* Form Ganti Password */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-orange-500" /> Ganti Password
        </h3>
        <form onSubmit={handleSavePw} className="space-y-4">
          {pwMsg && (
            <p className={`text-sm px-3 py-2 rounded-lg ${pwMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
              {pwMsg.text}
            </p>
          )}
          {[
            { name: "password_lama", label: "Password Lama" },
            { name: "password_baru", label: "Password Baru" },
            { name: "konfirmasi",    label: "Konfirmasi Password Baru" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm text-stone-700 mb-1 font-medium">{label}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name={name}
                  value={pwForm[name]}
                  onChange={handlePwChange}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${pwErrors[name] ? "border-red-400" : "border-stone-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors[name] && <p className="text-red-500 text-xs mt-1">{pwErrors[name][0]}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={savingPw}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            <Lock size={14} />
            {savingPw ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </div>

      {/* Hak Akses */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Hak Akses Staf</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-100">
                <th className="py-2 pr-4 font-medium">Menu</th>
                <th className="py-2 px-3 text-center font-medium">Lihat</th>
                <th className="py-2 px-3 text-center font-medium">Tambah</th>
                <th className="py-2 px-3 text-center font-medium">Edit</th>
                <th className="py-2 px-3 text-center font-medium">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {[
                ["Dashboard",        true,  false, false, false],
                ["Tenaga Kerja",     true,  true,  true,  true ],
                ["Pelatihan",        true,  false, false, false],
                ["Peserta Pelatihan",true,  false, true,  false],
                ["Sertifikasi",      true,  false, true,  false],
                ["Perusahaan Mitra", true,  true,  true,  true ],
                ["Job Fair",         true,  true,  true,  true ],
                ["Tracer Study",     true,  true,  true,  false],
                ["Laporan",          true,  false, false, false],
                ["Profil",           true,  true,  true,  false],
              ].map(([menu, lihat, tambah, edit, hapus]) => (
                <tr key={menu} className="hover:bg-stone-50">
                  <td className="py-2.5 pr-4 text-stone-700 font-medium">{menu}</td>
                  {[lihat, tambah, edit, hapus].map((val, i) => (
                    <td key={i} className="py-2.5 px-3 text-center">
                      <span className={val ? "text-emerald-500" : "text-stone-300"}>{val ? "✅" : "❌"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
