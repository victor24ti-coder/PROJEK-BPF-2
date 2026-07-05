import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, X, User } from "lucide-react";
import API from "../../../services/api";

const BACKEND = "http://127.0.0.1:8000/storage/";

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    status_peserta: "aktif",
    nilai: "",
  });
  const [currentFoto, setCurrentFoto] = useState(null);
  const [foto, setFoto]               = useState(null);
  const [preview, setPreview]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving,  setSaving]          = useState(false);
  const [errors,  setErrors]          = useState({});
  const [peserta, setPeserta]         = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/peserta-pelatihan/${id}`);
        const d   = res.data.data;
        setPeserta(d);
        setForm({
          status_peserta: d.status_peserta ?? "aktif",
          nilai:          d.nilai ?? "",
        });
        if (d.foto) setCurrentFoto(d.foto);
      } catch {
        alert("Gagal memuat data peserta.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.nilai !== "" && (isNaN(form.nilai) || form.nilai < 0 || form.nilai > 100))
      errs.nilai = "Nilai harus angka 0–100.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    fd.append("status_peserta", form.status_peserta);
    if (form.nilai !== "") fd.append("nilai", form.nilai);
    if (foto) fd.append("foto", foto);

    setSaving(true);
    try {
      await API.post(`/peserta-pelatihan/${id}?_method=PUT`, fd);
      navigate("/staf/peserta-pelatihan");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else alert(data?.message ?? "Terjadi kesalahan, coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-stone-500">
      <Loader2 className="w-6 h-6 animate-spin" /> Memuat data...
    </div>
  );

  const displayFoto = preview || (currentFoto ? `${BACKEND}${currentFoto}` : null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition text-stone-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-850 tracking-tight">Edit Peserta</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Update nilai, status, dan foto untuk <strong>{peserta?.tenaga_kerja?.nama}</strong>
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
          {(peserta?.tenaga_kerja?.nama ?? "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-stone-850">{peserta?.tenaga_kerja?.nama}</p>
          <p className="text-xs text-stone-500">Program: {peserta?.pelatihan?.nama_pelatihan}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wider">Foto Peserta</h2>
          <div className="flex items-center gap-5">
            {displayFoto ? (
              <div className="relative w-24 h-24">
                <img src={displayFoto} alt="foto" className="w-24 h-24 rounded-xl object-cover border border-stone-200" />
                {preview && (
                  <button type="button" onClick={handleRemoveFoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition">
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-stone-100 flex items-center justify-center border-2 border-dashed border-stone-300">
                <User className="w-10 h-10 text-stone-400" />
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition">
                <Upload size={16} />
                {displayFoto ? "Ganti Foto" : "Upload Foto"}
                <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
              </label>
              <p className="text-xs text-stone-400 mt-2">JPG, JPEG, PNG · Maks. 2MB</p>
            </div>
          </div>
        </div>

        {/* Nilai & Status */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Penilaian & Status</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status Kelulusan</label>
              <select name="status_peserta" value={form.status_peserta} onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="aktif">Aktif</option>
                <option value="lulus">Lulus</option>
                <option value="tidak_lulus">Tidak Lulus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nilai (0–100)</label>
              <input type="number" name="nilai" value={form.nilai} onChange={handleChange}
                min="0" max="100" placeholder="Contoh: 85"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.nilai ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.nilai && <p className="text-red-500 text-xs mt-1">{errors.nilai}</p>}
            </div>
          </div>

          {/* Grade preview */}
          {form.nilai !== "" && !isNaN(form.nilai) && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex items-center gap-3 text-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm
                ${form.nilai >= 90 ? "bg-emerald-500" : form.nilai >= 75 ? "bg-blue-500" : form.nilai >= 60 ? "bg-amber-500" : "bg-red-500"}`}>
                {form.nilai >= 90 ? "A" : form.nilai >= 75 ? "B" : form.nilai >= 60 ? "C" : "D"}
              </div>
              <span className="text-stone-600">
                Nilai <strong>{form.nilai}</strong> setara grade{" "}
                <strong>{form.nilai >= 90 ? "A (Sangat Baik)" : form.nilai >= 75 ? "B (Baik)" : form.nilai >= 60 ? "C (Cukup)" : "D (Kurang)"}</strong>
              </span>
            </div>
          )}
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
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
