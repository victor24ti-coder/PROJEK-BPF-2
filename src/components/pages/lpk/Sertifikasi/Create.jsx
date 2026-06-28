import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, FileText, X } from "lucide-react";
import { sertifikasiAPI, pesertaPelatihanAPI } from "../../../../services/api";

export default function Create() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    peserta_pelatihan_id: "",
    nama_sertifikasi:     "",
    lembaga_sertifikasi:  "",
    nomor_sertifikat:     "",
    tanggal_terbit:       "",
    masa_berlaku:         "",
    status_sertifikat:    "aktif",
  });
  const [file,      setFile]      = useState(null);
  const [pesertas,  setPesertas]  = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState({});

  useEffect(() => {
    // Ambil semua peserta pelatihan
    pesertaPelatihanAPI.getAll("paginate=false").then(r => {
      const payload = r.data.data;
      setPesertas(Array.isArray(payload) ? payload : (payload?.data ?? []));
    }).catch(() => {});
  }, []);

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
    setFile(selected);
    if (errors.file_sertifikat) setErrors(prev => ({ ...prev, file_sertifikat: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.peserta_pelatihan_id) errs.peserta_pelatihan_id = "Pilih peserta terlebih dahulu.";
    if (!form.nama_sertifikasi)     errs.nama_sertifikasi     = "Nama sertifikasi wajib diisi.";
    if (!form.lembaga_sertifikasi)  errs.lembaga_sertifikasi  = "Lembaga sertifikasi wajib diisi.";
    if (!form.nomor_sertifikat)     errs.nomor_sertifikat     = "Nomor sertifikat wajib diisi.";
    if (!form.tanggal_terbit)       errs.tanggal_terbit       = "Tanggal terbit wajib diisi.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (file) fd.append("file_sertifikat", file);

    setSaving(true);
    try {
      await sertifikasiAPI.create(fd);
      navigate("/lpk/sertifikasi");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else alert(data?.message ?? "Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition text-stone-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-stone-850 tracking-tight">Tambah Sertifikat</h1>
          <p className="text-stone-500 text-sm mt-0.5">Daftarkan sertifikat baru untuk peserta yang telah lulus pelatihan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Utama */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Informasi Sertifikat</h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Peserta */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Peserta <span className="text-red-500">*</span>
              </label>
              <select name="peserta_pelatihan_id" value={form.peserta_pelatihan_id} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${errors.peserta_pelatihan_id ? "border-red-400 bg-red-50" : "border-stone-300"}`}>
                <option value="">-- Pilih Peserta Pelatihan --</option>
                {pesertas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.tenaga_kerja?.nama ?? "—"} — {p.pelatihan?.nama_pelatihan ?? "—"}
                  </option>
                ))}
              </select>
              {errors.peserta_pelatihan_id && <p className="text-red-500 text-xs mt-1">{errors.peserta_pelatihan_id}</p>}
              {pesertas.length === 0 && <p className="text-amber-500 text-xs mt-1">⚠ Belum ada data peserta pelatihan.</p>}
            </div>

            {/* Nama Sertifikasi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Sertifikasi <span className="text-red-500">*</span></label>
              <input type="text" name="nama_sertifikasi" value={form.nama_sertifikasi} onChange={handleChange}
                placeholder="contoh: Sertifikat Kompetensi Pemrograman Web"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.nama_sertifikasi ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.nama_sertifikasi && <p className="text-red-500 text-xs mt-1">{errors.nama_sertifikasi}</p>}
            </div>

            {/* Lembaga */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Lembaga Sertifikasi <span className="text-red-500">*</span></label>
              <input type="text" name="lembaga_sertifikasi" value={form.lembaga_sertifikasi} onChange={handleChange}
                placeholder="contoh: LPK Maju Bersama"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.lembaga_sertifikasi ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.lembaga_sertifikasi && <p className="text-red-500 text-xs mt-1">{errors.lembaga_sertifikasi}</p>}
            </div>

            {/* Nomor Sertifikat */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nomor Sertifikat <span className="text-red-500">*</span></label>
              <input type="text" name="nomor_sertifikat" value={form.nomor_sertifikat} onChange={handleChange}
                placeholder="contoh: SRT-2026-001"
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.nomor_sertifikat ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.nomor_sertifikat && <p className="text-red-500 text-xs mt-1">{errors.nomor_sertifikat}</p>}
            </div>

            {/* Tanggal Terbit */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tanggal Terbit <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal_terbit" value={form.tanggal_terbit} onChange={handleChange}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.tanggal_terbit ? "border-red-400 bg-red-50" : "border-stone-300"}`} />
              {errors.tanggal_terbit && <p className="text-red-500 text-xs mt-1">{errors.tanggal_terbit}</p>}
            </div>

            {/* Masa Berlaku */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Masa Berlaku <span className="text-stone-400 text-xs">(Opsional)</span></label>
              <input type="date" name="masa_berlaku" value={form.masa_berlaku} onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            {/* Status */}
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
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Upload File Sertifikat</h2>
          {file ? (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-850 truncate">{file.name}</p>
                <p className="text-xs text-stone-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-red-400 hover:text-red-600 transition">
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition hover:bg-stone-50 ${errors.file_sertifikat ? "border-red-400 bg-red-50" : "border-stone-300"}`}>
              <Upload className="w-8 h-8 text-stone-400 mb-2" />
              <p className="text-sm text-stone-600 font-medium">Klik untuk pilih file PDF</p>
              <p className="text-xs text-stone-400 mt-1">Format: PDF · Maks. 5 MB</p>
              <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
            </label>
          )}
          {errors.file_sertifikat && <p className="text-red-500 text-xs mt-2">{errors.file_sertifikat}</p>}
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
            {saving ? "Menyimpan..." : "Simpan Sertifikat"}
          </button>
        </div>
      </form>
    </div>
  );
}
