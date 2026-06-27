import { useEffect, useState } from "react";
import { Search, BookOpen, Users, Eye, Loader2, AlertTriangle } from "lucide-react";
import { pelatihanAPI, lpkAPI } from "../../../services/api";

const STATUS_LABEL = { aktif: "Aktif", selesai: "Selesai", nonaktif: "Nonaktif" };
const STATUS_COLOR = {
  aktif:    "bg-emerald-100 text-emerald-700",
  selesai:  "bg-stone-100 text-stone-600",
  nonaktif: "bg-red-100 text-red-600",
};

export default function StafPelatihanPage() {
  const [data, setData]       = useState([]);
  const [lpks, setLpks]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");
  const [filterLpk, setFilterLpk]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [detail, setDetail]   = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resP, resL] = await Promise.all([
        pelatihanAPI.getAll(),
        lpkAPI.getAll("false"),
      ]);
      const raw = resP.data.data ?? [];
      setData(Array.isArray(raw) ? raw : (raw?.data ?? []));
      const rawL = resL.data.data ?? [];
      setLpks(Array.isArray(rawL) ? rawL : (rawL?.data ?? []));
    } catch {
      setError("Gagal memuat data pelatihan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = data.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      (item.nama_pelatihan ?? "").toLowerCase().includes(q) ||
      (item.jurusan ?? "").toLowerCase().includes(q) ||
      (item.lpk?.nama_lpk ?? "").toLowerCase().includes(q);
    const matchLpk    = filterLpk    ? String(item.lpk_id) === filterLpk : true;
    const matchStatus = filterStatus ? item.status === filterStatus      : true;
    return matchSearch && matchLpk && matchStatus;
  });

  const stats = {
    total:   data.length,
    aktif:   data.filter((d) => d.status === "aktif").length,
    selesai: data.filter((d) => d.status === "selesai").length,
    peserta: data.reduce((acc, d) => acc + (d.peserta?.length ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Monitoring Pelatihan</h1>
        <p className="text-sm text-stone-500 mt-1">Data seluruh pelatihan dari semua LPK (hanya lihat)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Pelatihan", value: stats.total,   color: "text-blue-600" },
          { label: "Sedang Aktif",    value: stats.aktif,   color: "text-emerald-600" },
          { label: "Selesai",         value: stats.selesai, color: "text-stone-500" },
          { label: "Total Peserta",   value: stats.peserta, color: "text-violet-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari pelatihan, jurusan, LPK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <select
          value={filterLpk}
          onChange={(e) => setFilterLpk(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Semua LPK</option>
          {lpks.map((l) => (
            <option key={l.id} value={String(l.id)}>{l.nama_lpk}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="selesai">Selesai</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 border-b border-red-100">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nama Pelatihan</th>
                <th className="px-4 py-3 font-medium">LPK</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Kuota</th>
                <th className="px-4 py-3 font-medium">Peserta</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-stone-400 text-sm">Memuat data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <BookOpen className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-stone-400 text-sm">Tidak ada data pelatihan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50 transition">
                    <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">{item.nama_pelatihan}</p>
                      <p className="text-xs text-stone-400">{item.jurusan}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{item.lpk?.nama_lpk ?? "-"}</td>
                    <td className="px-4 py-3 text-stone-600">{item.jenis_pelatihan ?? "-"}</td>
                    <td className="px-4 py-3 text-stone-600">{item.kuota ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-stone-600">
                        <Users size={13} />
                        {item.peserta?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLOR[item.status] ?? "bg-stone-100 text-stone-600"}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetail(item)}
                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-800">Detail Pelatihan</h3>
              <button onClick={() => setDetail(null)} className="text-stone-400 hover:text-stone-700 text-xl leading-none">&times;</button>
            </div>
            {[
              ["Nama Pelatihan", detail.nama_pelatihan],
              ["LPK",           detail.lpk?.nama_lpk ?? "-"],
              ["Jenis",         detail.jenis_pelatihan],
              ["Jurusan",       detail.jurusan],
              ["Kuota",         detail.kuota],
              ["Peserta",       detail.peserta?.length ?? 0],
              ["Status",        STATUS_LABEL[detail.status] ?? detail.status],
              ["Mulai",         detail.tanggal_mulai ?? "-"],
              ["Selesai",       detail.tanggal_selesai ?? "-"],
            ].map(([k, v]) => (
              <div key={k} className="flex text-sm">
                <span className="w-36 text-stone-500 shrink-0">{k}</span>
                <span className="text-stone-800 font-medium">{v}</span>
              </div>
            ))}
            {detail.deskripsi && (
              <div className="text-sm">
                <p className="text-stone-500 mb-1">Deskripsi</p>
                <p className="text-stone-700 bg-stone-50 rounded-lg p-3">{detail.deskripsi}</p>
              </div>
            )}
            <button
              onClick={() => setDetail(null)}
              className="w-full border border-stone-300 rounded-lg py-2 text-sm text-stone-600 hover:bg-stone-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
