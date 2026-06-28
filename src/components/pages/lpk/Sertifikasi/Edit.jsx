import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, FileText, X } from "lucide-react";
import { sertifikasiAPI } from "../../../../services/api";

const BACKEND = "http://127.0.0.1:8000/storage/";

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama_sertifikasi:    "",
    lembaga_sertifikasi: "",
    nomor_sertifikat:    "",
    tanggal_terbit:      "",
    masa_berlaku:        "",
    status_sertifikat:   "aktif",
  });
  const [currentFile, setCurrentFile] = useState(null);
  const [newFile,     setNewFile]     = useState(null);
  const [sertifikasi, setSertifikasi] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});

  useEffect(() => {
    sertifikasiAPI.getById(id).then(r => {
      const d = r.data.data;
      setSertifikasi(d);
      setCurrentFile(d.file_sertifikat ?? null);
      setForm({
        nama_sertifikasi:    d.nama_sertifikasi    ?? "",
        lembaga_sertifikasi: d.lembaga_sertifikasi ?? "",
        nomor_sertifikat:    d.nomor_sertifikat    ?? "",
        tanggal_terbit:      d.tanggal_terbit      ?? "",
        masa_berlaku:        d.masa_berlaku         ?? "",
        status_sertifikat:   d.status_sertifikat   ?? "aktif",
      });
    }).catch(() => {
      alert("Gagal memuat data sertifikat.");
      navigate(-1);
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file_sertifikat: "Ukuran file maksimal 5 MB." }));
      return;
    }
    setNewFile(selected);
    if (errors.file_sertifikat) setErrors(prev => ({ ...prev, file_sertifikat: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.nama_sertifikasi)    errs.nama_sertifikasi    = "Nama sertifikasi wajib diisi.";
    if (!form.lembaga_sertifikasi) errs.lembaga_sertifikasi = "Lembaga sertifikasi wajib diisi.";
    if (!form.nomor_sertifikat)    errs.nomor_sertifikat    = "Nomor sertifikat wajib diisi.";
    if (!form.tanggal_terbit)      errs.tanggal_terbit      = "Tanggal terbit wajib diisi.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v); });
    if (newFile) fd.append("file_sertifikat", newFile);

    setSaving(true);
    try {
      await sertifikasiAPI.update(id, fd);
      navigate("/lpk/sertifikasi");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else alert(data?.message ?? "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-stone-500">
      <Loader2 className="w-6 h-6 animate-spin" /> Memuat data...
    </div>
  );

  const peserta  = sertifikasi?.peserta_pelatihan?.tenaga_kerja;
  const pelatihan = sertifikasi?.peserta_pelatihan?.pelatihan;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition text-stone-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-850 tracking-tight">Edit Sertifikat</h1>
          <p className="text-stone-500 text-sm mt-0.5">Perbarui informasi sertifikat <strong>{form.nomor_sertifikat}</strong></p>
        </div>
      </div>

      {/* Info Peserta (read-only) */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
          {(peserta?.nama ?? "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-stone-850">{peserta?.nama ?? "—"}</p>
          <p className="text-xs text-stone-500">NIK: {peserta?.nik ?? "—"} · Pelatihan: {pelatihan?.nama_pelatihan ?? "—"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Sertifikat */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Informasi Sertifikat</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Sertifikasi <span className="text-red-500">*</span></label>
              <input type="text" name="nama_sertifikasi" value={form.nama_sertifikasi} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.nama_sertifikasi ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.nama_sertifikasi && <p className="text-red-500 text-xs mt-1">{errors.nama_sertifikasi}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Lembaga Sertifikasi <span className="text-red-500">*</span></label>
              <input type="text" name="lembaga_sertifikasi" value={form.lembaga_sertifikasi} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.lembaga_sertifikasi ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.lembaga_sertifikasi && <p className="text-red-500 text-xs mt-1">{errors.lembaga_sertifikasi}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nomor Sertifikat <span className="text-red-500">*</span></label>
              <input type="text" name="nomor_sertifikat" value={form.nomor_sertifikat} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.nomor_sertifikat ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.nomor_sertifikat && <p className="text-red-500 text-xs mt-1">{errors.nomor_sertifikat}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tanggal Terbit <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal_terbit" value={form.tanggal_terbit} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.tanggal_terbit ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.tanggal_terbit && <p className="text-red-500 text-xs mt-1">{errors.tanggal_terbit}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Masa Berlaku <span className="text-stone-400 text-xs">(Opsional)</span></label>
              <input type="date" name="masa_berlaku" value={form.masa_berlaku} onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Status</label>
              <select name="status_sertifikat" value={form.status_sertifikat} onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload PDF */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">File Sertifikat (PDF)</h2>

          {/* File baru */}
          {newFile ? (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-850 truncate">{newFile.name}</p>
                <p className="text-xs text-stone-400">{(newFile.size / 1024).toFixed(1)} KB · File baru</p>
              </div>
              <button type="button" onClick={() => setNewFile(null)} className="text-red-400 hover:text-red-600 transition">
                <X size={18} />
              </button>
            </div>
          ) : currentFile ? (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-850">File saat ini</p>
                <a href={`${BACKEND}${currentFile}`} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline">{currentFile.split('/').pop()}</a>
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-2 cursor-pointer bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition w-fit">
            <Upload size={16} />
            {currentFile ? "Ganti File PDF" : "Upload File PDF"}
            <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          </label>
          <p className="text-xs text-stone-400">Format: PDF · Maks. 5 MB</p>
          {errors.file_sertifikat && <p className="text-red-500 text-xs">{errors.file_sertifikat}</p>}
        </div>

        {/* Aksi */}
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
