import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, X, User } from "lucide-react";
import API from "../../../services/api";

export default function Create() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenaga_kerja_id: "",
    pelatihan_id:    "",
    status_peserta:  "aktif",
    nilai:           "",
  });
  const [foto, setFoto]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [pelatihans, setPelatihans] = useState([]);
  const [workers, setWorkers]     = useState([]);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});

  useEffect(() => {
    // API endpoint for admin to get all pelatihan
    API.get('/lpk/pelatihan').then(r => setPelatihans(r.data.data ?? [])).catch(() => {});
    // API endpoint for admin to get all tenaga kerja
    API.get('/tenaga-kerja?paginate=false').then(r => {
      const payload = r.data.data;
      setWorkers(Array.isArray(payload) ? payload : (payload?.data ?? []));
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setPreview(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.tenaga_kerja_id) errs.tenaga_kerja_id = "Pilih tenaga kerja terlebih dahulu.";
    if (!form.pelatihan_id)    errs.pelatihan_id    = "Pilih program pelatihan terlebih dahulu.";
    if (form.nilai !== "" && (isNaN(form.nilai) || form.nilai < 0 || form.nilai > 100))
      errs.nilai = "Nilai harus berupa angka antara 0–100.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    fd.append("tenaga_kerja_id", form.tenaga_kerja_id);
    fd.append("pelatihan_id",    form.pelatihan_id);
    fd.append("status_peserta",  form.status_peserta);
    if (form.nilai !== "") fd.append("nilai", form.nilai);
    if (foto) fd.append("foto", foto);

    setSaving(true);
    try {
      await API.post('/peserta-pelatihan', fd);
      navigate("/staf/peserta-pelatihan");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else alert(data?.message ?? "Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition text-stone-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-850 tracking-tight">Daftarkan Peserta</h1>
          <p className="text-stone-500 text-sm mt-0.5">Tambah peserta baru ke program pelatihan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto Upload */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wider">Foto Peserta</h2>
          <div className="flex items-center gap-5">
            {preview ? (
              <div className="relative w-24 h-24">
                <img src={preview} alt="preview" className="w-24 h-24 rounded-xl object-cover border border-stone-200" />
                <button type="button" onClick={handleRemoveFoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-stone-100 flex items-center justify-center border-2 border-dashed border-stone-300">
                <User className="w-10 h-10 text-stone-400" />
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                <Upload size={16} />
                Upload Foto
                <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
              </label>
              <p className="text-xs text-stone-400 mt-2">JPG, JPEG, PNG · Maks. 2MB</p>
            </div>
          </div>
        </div>

        {/* Form Data */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Informasi Pendaftaran</h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Tenaga Kerja */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Tenaga Kerja <span className="text-red-500">*</span>
              </label>
              <select name="tenaga_kerja_id" value={form.tenaga_kerja_id} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${errors.tenaga_kerja_id ? "border-red-400 bg-red-50" : "border-stone-300"}`}>
                <option value="">-- Pilih Tenaga Kerja --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.nama} — {w.nik}</option>
                ))}
              </select>
              {errors.tenaga_kerja_id && <p className="text-red-500 text-xs mt-1">{errors.tenaga_kerja_id}</p>}
            </div>

            {/* Pelatihan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Program Pelatihan <span className="text-red-500">*</span>
              </label>
              <select name="pelatihan_id" value={form.pelatihan_id} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${errors.pelatihan_id ? "border-red-400 bg-red-50" : "border-stone-300"}`}>
                <option value="">-- Pilih Pelatihan --</option>
                {pelatihans.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_pelatihan}</option>
                ))}
              </select>
              {errors.pelatihan_id && <p className="text-red-500 text-xs mt-1">{errors.pelatihan_id}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status Keikutsertaan</label>
              <select name="status_peserta" value={form.status_peserta} onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="aktif">Aktif</option>
                <option value="lulus">Lulus</option>
                <option value="tidak_lulus">Tidak Lulus</option>
              </select>
            </div>

            {/* Nilai */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nilai (0–100)</label>
              <input type="number" name="nilai" value={form.nilai} onChange={handleChange}
                min="0" max="100" placeholder="Contoh: 85"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.nilai ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.nilai && <p className="text-red-500 text-xs mt-1">{errors.nilai}</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="border border-stone-300 text-stone-700 hover:bg-stone-50 px-5 py-2.5 rounded-lg text-sm font-medium transition">
            Batal
          </button>
          <button type="submit" disabled={saving}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            {saving ? "Menyimpan..." : "Daftarkan Peserta"}
          </button>
        </div>
      </form>
    </div>
  );
}
