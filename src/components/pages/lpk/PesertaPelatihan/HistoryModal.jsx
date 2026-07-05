import { useState, useEffect } from "react";
import {
  X, Loader2, History, AlertTriangle, ChevronLeft, ChevronRight,
  User, Calendar, FileText
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";

export default function HistoryModal({ isOpen, onClose }) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [page, setPage] = useState(1);

  const fetchHistory = async (pg = page) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await lpkPortalAPI.pesertaPelatihan.getImportHistory(`page=${pg}`);
      if (response.data.success) {
        const payload = response.data.data;
        setData(payload.data ?? []);
        setMeta({
          current_page: payload.current_page,
          last_page: payload.last_page,
          total: payload.total
        });
      } else {
        setErrorMsg("Gagal memuat data riwayat.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat riwayat import.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-850">Riwayat Import Excel</h3>
              <p className="text-xs text-stone-500">Log pendaftaran peserta secara massal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <p className="text-sm font-medium">Memuat riwayat import...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    {["Waktu", "Nama File", "Program Pelatihan", "Total Baris", "Berhasil", "Operator"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-150">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/55 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-stone-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-stone-400" />
                          {formatDate(item.created_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-850 font-semibold max-w-[180px] truncate" title={item.filename}>
                        <span className="flex items-center gap-1.5">
                          <FileText size={14} className="text-blue-500" />
                          {item.filename}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-700 font-medium">{item.pelatihan?.nama_pelatihan ?? "—"}</td>
                      <td className="px-5 py-3.5 font-semibold text-stone-700">{item.total_rows}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold text-xs">
                          {item.valid_rows}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-stone-400" />
                          {item.user?.nama ?? item.user?.name ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-500 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
              <History size={40} className="mx-auto text-stone-300 mb-3" />
              <p className="font-semibold text-stone-600">Belum Ada Riwayat Import</p>
              <p className="text-xs text-stone-400 mt-1">Seluruh log pendaftaran via Excel akan tercatat di sini.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-stone-500">Halaman {meta.current_page} dari {meta.last_page}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page === 1}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={meta.current_page === meta.last_page}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-600 hover:bg-stone-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
