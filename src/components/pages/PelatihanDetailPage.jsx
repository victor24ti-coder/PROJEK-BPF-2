import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Loader2, AlertTriangle, Calendar, User, Clock, Building2, BookOpen, CheckCircle, ShieldAlert, Compass } from "lucide-react";

export default function PelatihanDetailPage() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get("/data/pelatihan-data.json")
      .then((response) => {
        if (response.status !== 200) {
          setError("Gagal mengambil data dari server.");
          return;
        }
        
        // Cari program pelatihan berdasarkan ID
        const selected = (response.data || []).find(
          (item) => item.id === parseInt(id)
        );

        if (!selected) {
          setError("Program pelatihan tidak ditemukan.");
          return;
        }

        setProgram(selected);
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat rincian kelas pelatihan.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Badge warna untuk Kategori Kejuruan
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Teknik Las":
        return "bg-red-50 text-red-700 border-red-100";
      case "Teknik Otomotif":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "Teknik Informasi":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Kelistrikan":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "Tata Boga":
        return "bg-purple-50 text-purple-700 border-purple-100";
      default:
        return "bg-stone-50 text-stone-700 border-stone-100";
    }
  };

  // Badge status alumni / tracer study
  const getTracerStatusBadge = (status) => {
    switch (status) {
      case "Bekerja":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            Bekerja
          </span>
        );
      case "Wirausaha":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
            Wirausaha
          </span>
        );
      case "Belum Bekerja":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-100">
            Belum Bekerja
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-100">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-stone-50/50 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium text-stone-500">Memuat rincian kelas pelatihan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50/50 p-6">
        <div className="max-w-md w-full bg-white border border-stone-250 rounded-xl p-6 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-stone-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-sm text-stone-600 mb-6">{error}</p>
          <Link
            to="/pelatihan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pelatihan
          </Link>
        </div>
      </div>
    );
  }

  if (!program) return null;

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-50/50">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Link */}
        <Link
          to="/pelatihan"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6 group transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Daftar Pelatihan
        </Link>

        {/* main Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          <div className="p-8 border-b border-stone-150 bg-stone-50/50">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(program.category)}`}>
                {program.category}
              </span>
              <span className="text-xs text-stone-400 font-medium">ID Kelas: PLT-{program.id.toString().padStart(3, '0')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
              {program.title}
            </h1>
            <p className="text-sm text-stone-500 leading-relaxed max-w-3xl">
              {program.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-150 bg-white">
            
            {/* LPK */}
            <div className="p-5 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Penyelenggara LPK</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{program.lpk}</p>
              </div>
            </div>

            {/* Instructor */}
            <div className="p-5 flex items-start gap-3">
              <User className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Instruktur Kelas</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{program.instructor}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="p-5 flex items-start gap-3">
              <Clock className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Durasi Pelatihan</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{program.duration}</p>
              </div>
            </div>

            {/* Date */}
            <div className="p-5 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-stone-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400 uppercase font-semibold">Periode Pelaksanaan</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">
                  {program.startDate} - {program.endDate}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Syllabus Card */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 lg:col-span-1">
            <div className="flex items-center gap-2 border-b border-stone-150 pb-4 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-stone-900">Kurikulum & Silabus</h2>
            </div>
            <ul className="space-y-3">
              {program.syllabus.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-stone-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Trainees Table (Tracer Study Integration) */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-stone-150 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-stone-900">Daftar Peserta & Tracer Study</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-100">
                Terdaftar: {program.participantsCount} / {program.quota}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-stone-150 bg-white">
              <table className="min-w-full divide-y divide-stone-150">
                <thead className="bg-stone-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">#</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">ID Peserta</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">Nama Lengkap</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">L/P</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-stone-500 uppercase">Status Alumni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {program.trainees && program.trainees.length > 0 ? (
                    program.trainees.map((trainee, index) => (
                      <tr key={trainee.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-2.5 font-medium text-stone-500">{index + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-stone-700">{trainee.id}</td>
                        <td className="px-4 py-2.5 text-stone-900 font-medium">{trainee.name}</td>
                        <td className="px-4 py-2.5 text-stone-600">{trainee.gender === "Laki-laki" ? "L" : "P"}</td>
                        <td className="px-4 py-2.5">{getTracerStatusBadge(trainee.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-6 text-center text-stone-500 text-xs">
                        Tidak ada data peserta terdaftar untuk kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Note */}
            <div className="flex gap-2 p-3 bg-stone-50 border border-stone-200 rounded-lg mt-4 text-xs text-stone-500">
              <ShieldAlert className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
              <span>
                Status alumni dipantau secara berkala melalui survei alumni <strong>Tracer Study</strong> (Kebutuhan Fungsional F09) setelah masa pelatihan selesai.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
