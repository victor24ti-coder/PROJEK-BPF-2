import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Edit2, User, GraduationCap, Award, FileText,
  Loader2, AlertTriangle, Star
} from "lucide-react";
import API from "../../../services/api";

const BACKEND = "http://127.0.0.1:8000/storage/";

const STATUS_MAP = {
  aktif:       { label: "Aktif",       cls: "bg-blue-50 text-blue-700 border-blue-100"       },
  lulus:       { label: "Lulus",       cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  tidak_lulus: { label: "Tidak Lulus", cls: "bg-red-50 text-red-700 border-red-100"           },
};

const Stat = ({ label, val, icon, accent }) => (
  <div className={`bg-${accent}-50 border border-${accent}-100 rounded-xl p-4`}>
    <p className={`text-xs font-semibold uppercase tracking-wider text-${accent}-500 mb-1`}>{label}</p>
    <div className={`flex items-center gap-2 text-${accent}-700`}>
      {icon}
      <span className="text-xl font-bold">{val}</span>
    </div>
  </div>
);

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    API.get(`/peserta-pelatihan/${id}`)
      .then(r => setData(r.data.data))
      .catch(() => setError("Gagal memuat detail peserta."))
      .finally(() => setLoading(false));
  }, [id]);

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

  const st    = STATUS_MAP[data.status_peserta] ?? { label: data.status_peserta, cls: "bg-gray-100 text-gray-700" };
  const grade = data.nilai >= 90 ? "A" : data.nilai >= 75 ? "B" : data.nilai >= 60 ? "C" : data.nilai != null ? "D" : null;
  const gradeColor = { A: "emerald", B: "blue", C: "amber", D: "red" }[grade] ?? "stone";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition text-stone-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-850 tracking-tight">Detail Peserta</h1>
            <p className="text-stone-500 text-sm mt-0.5">Informasi lengkap peserta pelatihan</p>
          </div>
        </div>
        <Link to={`/staf/peserta-pelatihan/edit/${data.id}`}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm">
          <Edit2 size={16} /> Edit / Nilai
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {data.foto ? (
          <img src={`${BACKEND}${data.foto}`} alt="foto"
            className="w-28 h-28 rounded-2xl object-cover border-2 border-stone-200 shadow-sm" />
        ) : (
          <div className="w-28 h-28 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center text-4xl font-bold shadow-sm">
            {(data.tenaga_kerja?.nama ?? "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-stone-850">{data.tenaga_kerja?.nama ?? "-"}</h2>
          <p className="text-stone-500 text-sm mt-0.5">NIK: {data.tenaga_kerja?.nik ?? "-"}</p>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${st.cls}`}>
              {st.label}
            </span>
            {grade && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-${gradeColor}-50 text-${gradeColor}-700 border border-${gradeColor}-100`}>
                <Star size={13} />
                Grade {grade}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {data.nilai != null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Nilai Akhir" val={data.nilai} icon={<Award size={20} />} accent={gradeColor} />
          <Stat label="Grade"       val={grade}      icon={<Star size={20} />} accent={gradeColor} />
          <Stat label="Predikat"    val={grade === "A" ? "Sangat Baik" : grade === "B" ? "Baik" : grade === "C" ? "Cukup" : "Kurang"} icon={<GraduationCap size={20} />} accent={gradeColor} />
        </div>
      )}

      {/* Detail Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Program Pelatihan */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" /> Program Pelatihan
          </h3>
          <InfoRow label="Nama Program" val={data.pelatihan?.nama_pelatihan} />
          <InfoRow label="Jenis"        val={data.pelatihan?.jenis_pelatihan} />
          <InfoRow label="Jurusan"      val={data.pelatihan?.jurusan} />
          <InfoRow label="Kuota"        val={data.pelatihan?.kuota ? `${data.pelatihan.kuota} peserta` : "-"} />
        </div>

        {/* Tenaga Kerja */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider">
            <User className="w-4 h-4" /> Data Tenaga Kerja
          </h3>
          <InfoRow label="Nama"    val={data.tenaga_kerja?.nama} />
          <InfoRow label="NIK"     val={data.tenaga_kerja?.nik} />
          <InfoRow label="Email"   val={data.tenaga_kerja?.email} />
          <InfoRow label="Telepon" val={data.tenaga_kerja?.no_telepon ?? data.tenaga_kerja?.telepon} />
        </div>

        {/* Sertifikasi */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 md:col-span-2">
          <h3 className="font-semibold text-stone-700 flex items-center gap-2 text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Sertifikasi
          </h3>
          {data.sertifikasi ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="No. Sertifikat" val={data.sertifikasi.no_sertifikat} />
              <InfoRow label="Tanggal Terbit"  val={data.sertifikasi.tanggal_terbit} />
              <InfoRow label="Jenis"           val={data.sertifikasi.jenis_sertifikat} />
              <InfoRow label="Status"          val={data.sertifikasi.status_sertifikat} />
            </div>
          ) : (
            <div className={`rounded-lg p-4 text-sm ${data.status_peserta === "lulus" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-stone-50 text-stone-500"}`}>
              {data.status_peserta === "lulus"
                ? "Peserta telah lulus namun sertifikat belum diterbitkan. Silakan terbitkan dari modul Sertifikasi."
                : "Sertifikat hanya diterbitkan untuk peserta dengan status Lulus."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, val }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-sm text-stone-400 font-medium shrink-0">{label}</span>
    <span className="text-sm text-stone-800 font-semibold text-right">{val ?? "-"}</span>
  </div>
);
