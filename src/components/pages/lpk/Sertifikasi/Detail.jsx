import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Edit2, Download, FileText, Loader2, AlertTriangle,
  Award, CheckCircle, XCircle, Calendar, User, BookOpen, Hash
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_MAP = {
  aktif:       { label: "Aktif",       cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle size={14} /> },
  tidak_aktif: { label: "Tidak Aktif", cls: "bg-red-50 text-red-700 border-red-100",             icon: <XCircle size={14} /> },
};

const InfoRow = ({ label, value, mono }) => (
  <div className="flex justify-between items-start py-3 border-b border-stone-100 last:border-0 gap-4">
    <span className="text-sm text-stone-400 font-medium flex-shrink-0">{label}</span>
    <span className={`text-sm text-stone-850 font-semibold text-right ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
  </div>
);

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    lpkPortalAPI.sertifikasi.getById(id)
      .then(r => setData(r.data.data))
      .catch(() => setError("Gagal memuat detail sertifikat."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res  = await lpkPortalAPI.sertifikasi.download(id);
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href     = url;
      link.download = `sertifikat_${data.nomor_sertifikat}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("File sertifikat tidak ditemukan atau gagal diunduh.");
    } finally {
      setDownloading(false);
    }
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return "—";
    return new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-stone-500">
      <Loader2 className="w-6 h-6 animate-spin" /> Memuat data...
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5" /> {error}
    </div>
  );

  const peserta   = data.peserta_pelatihan?.tenaga_kerja;
  const pelatihan = data.peserta_pelatihan?.pelatihan;
  const st        = STATUS_MAP[data.status_sertifikat] ?? { label: data.status_sertifikat, cls: "bg-gray-100 text-gray-700", icon: null };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition text-stone-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-850 tracking-tight">Detail Sertifikat</h1>
            <p className="text-stone-500 text-sm mt-0.5">Informasi lengkap sertifikat peserta</p>
          </div>
        </div>
        <div className="flex gap-2">
          {data.file_sertifikat && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={16} />}
              {downloading ? "Mengunduh..." : "Unduh PDF"}
            </button>
          )}
          <Link
            to={`/lpk/sertifikasi/edit/${data.id}`}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Edit2 size={16} /> Edit
          </Link>
        </div>
      </div>

      {/* Badge Nomor Sertifikat */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Nomor Sertifikat</p>
          <h2 className="text-2xl font-bold text-white font-mono mt-0.5">{data.nomor_sertifikat}</h2>
          <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/20 text-white border-white/30`}>
            {st.icon} {st.label}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Data Peserta */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
            <User className="w-4 h-4" /> Data Peserta
          </h3>
          <InfoRow label="Nama Peserta"  value={peserta?.nama} />
          <InfoRow label="NIK"           value={peserta?.nik}  mono />
          <InfoRow label="Email"         value={peserta?.email} />
          <InfoRow label="No. Telepon"   value={peserta?.no_telepon ?? peserta?.telepon} />
        </div>

        {/* Data Pelatihan */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4" /> Program Pelatihan
          </h3>
          <InfoRow label="Nama Pelatihan"  value={pelatihan?.nama_pelatihan} />
          <InfoRow label="Jenis Pelatihan" value={pelatihan?.jenis_pelatihan} />
          <InfoRow label="Jurusan"         value={pelatihan?.jurusan} />
          <InfoRow label="Nilai Akhir"     value={data.peserta_pelatihan?.nilai != null ? `${data.peserta_pelatihan.nilai} / 100` : null} />
        </div>

        {/* Data Sertifikat */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
            <Hash className="w-4 h-4" /> Detail Sertifikat
          </h3>
          <InfoRow label="Nama Sertifikasi"    value={data.nama_sertifikasi} />
          <InfoRow label="Lembaga Sertifikasi" value={data.lembaga_sertifikasi} />
          <InfoRow label="Nomor Sertifikat"    value={data.nomor_sertifikat} mono />
          <InfoRow label="Tanggal Terbit"      value={formatTanggal(data.tanggal_terbit)} />
          <InfoRow label="Masa Berlaku"        value={data.masa_berlaku ? formatTanggal(data.masa_berlaku) : "Seumur Hidup"} />
        </div>

        {/* File Sertifikat */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">
            <FileText className="w-4 h-4" /> File Sertifikat
          </h3>
          {data.file_sertifikat ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <FileText className="w-10 h-10 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-850">File PDF Tersedia</p>
                  <p className="text-xs text-stone-400 truncate">{data.file_sertifikat.split('/').pop()}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleDownload} disabled={downloading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download size={14} />}
                  Unduh PDF
                </button>
                <a
                  href={`${BACKEND}${data.file_sertifikat}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  <FileText size={14} /> Lihat di Browser
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-200 rounded-lg p-6 text-center">
              <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500 font-medium">Belum ada file PDF</p>
              <p className="text-xs text-stone-400 mt-1">Upload file melalui menu Edit</p>
              <Link to={`/lpk/sertifikasi/edit/${data.id}`}
                className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:underline">
                <Edit2 size={12} /> Upload sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
