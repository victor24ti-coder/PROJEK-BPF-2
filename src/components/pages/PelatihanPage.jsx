import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Loader2, AlertTriangle, BookOpen, Eye, Award, GraduationCap, Users } from "lucide-react";

export default function PelatihanPage() {
  const [pelatihan, setPelatihan] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk ringkasan stats
  const [stats, setStats] = useState({ total: 0, berjalan: 0, selesai: 0, peserta: 0 });

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      axios
        .get("/data/pelatihan-data.json")
        .then((response) => {
          if (response.status !== 200) {
            setError("Gagal memuat data pelatihan.");
            return;
          }
          
          const rawData = response.data || [];
          
          // Hitung stats berdasarkan data mentah sekali saja
          const total = rawData.length;
          const berjalan = rawData.filter(item => item.status === "Berjalan").length;
          const selesai = rawData.filter(item => item.status === "Selesai").length;
          const peserta = rawData.reduce((acc, curr) => acc + curr.participantsCount, 0);
          setStats({ total, berjalan, selesai, peserta });

          // Filter data berdasarkan query pencarian
          const filtered = rawData.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase()) ||
            item.lpk.toLowerCase().includes(query.toLowerCase())
          );
          setPelatihan(filtered);
        })
        .catch((err) => {
          setError(err.message || "Gagal menghubungi server data.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [query]);

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

  // Badge status pelatihan
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pendaftaran":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pendaftaran
          </span>
        );
      case "Berjalan":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Berjalan
          </span>
        );
      case "Selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-150 text-stone-800 border border-stone-250">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-stone-50/50">
      
      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Total Program</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.total} Kelas</h4>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Sedang Berjalan</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.berjalan} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Program Selesai</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.selesai} Kelas</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Total Peserta</p>
            <h4 className="text-xl font-bold text-stone-900">{stats.peserta} Orang</h4>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
        {/* Header Table Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Program Pelatihan Kerja</h2>
            <p className="text-sm text-stone-500 mt-1">
              Data pendaftaran, penyelenggaraan, dan LPK pelaksana pelatihan di Provinsi Riau.
            </p>
          </div>
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kelas, kejuruan, atau LPK..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {loading && query && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Nama Program Pelatihan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Kejuruan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Penyelenggara LPK
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-28">
                    Durasi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-32">
                    Kuota Peserta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {loading ? (
                  // Skeleton Loading Rows
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-6"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-56"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-36"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-5 bg-stone-200 rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-stone-200 rounded-lg w-16 mx-auto"></div></td>
                    </tr>
                  ))
                ) : pelatihan.length > 0 ? (
                  pelatihan.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-stone-600">
                        {index + 1}.
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link 
                          to={`/pelatihan/${item.id}`} 
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-700">
                        {item.lpk}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 font-medium">
                        {item.duration}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-800">{item.participantsCount}</span>
                          <span className="text-stone-400">/</span>
                          <span className="text-stone-500">{item.quota} pax</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <Link
                          to={`/pelatihan/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-blue-600 hover:text-white text-stone-700 text-xs font-semibold rounded-lg transition-all duration-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Empty State
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-sm text-stone-500">
                      Tidak ada program pelatihan ditemukan{query ? ` untuk kata kunci "${query}"` : ""}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
