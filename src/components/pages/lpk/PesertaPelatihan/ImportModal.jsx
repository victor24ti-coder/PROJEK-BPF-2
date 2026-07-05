import { useState } from "react";
import * as XLSX from "xlsx";
import {
  X, Upload, FileSpreadsheet, Loader2, AlertTriangle, CheckCircle,
  HelpCircle, Info
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";

export default function ImportModal({ isOpen, onClose, onSuccess, pelatihans }) {
  const [pelatihanId, setPelatihanId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!pelatihanId) {
      setErrorMsg("Pilih program pelatihan terlebih dahulu.");
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    parseExcel(selectedFile);
  };

  const parseExcel = (selectedFile) => {
    setLoading(true);
    setPreviewData(null);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          setErrorMsg("File Excel kosong atau tidak memiliki baris data.");
          setLoading(false);
          return;
        }

        // Validate structure (must have NIK at minimum, others optional)
        const sample = rawData[0];
        const hasNik = Object.keys(sample).some(k => k.toLowerCase() === "nik");
        if (!hasNik) {
          setErrorMsg("Format kolom tidak sesuai. Kolom 'NIK' wajib ada di baris pertama.");
          setLoading(false);
          return;
        }

        // Call backend for validation preview
        const response = await lpkPortalAPI.pesertaPelatihan.importPreview({
          pelatihan_id: pelatihanId,
          data: rawData
        });

        if (response.data.success) {
          setPreviewData(response.data.preview);
          setSummary(response.data.summary);
        } else {
          setErrorMsg("Gagal melakukan validasi data.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Format file Excel tidak didukung atau rusak.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg("Gagal membaca file.");
      setLoading(false);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleImport = async () => {
    if (!previewData || !summary || summary.valid === 0) return;

    // Filter only valid rows to send
    const validRows = previewData.filter(row => row.is_valid);

    setImporting(true);
    try {
      const response = await lpkPortalAPI.pesertaPelatihan.importCommit({
        pelatihan_id: pelatihanId,
        filename: file.name,
        data: validRows
      });

      if (response.data.success) {
        alert(response.data.message);
        onSuccess();
        onClose();
        resetModal();
      } else {
        setErrorMsg("Gagal menyimpan data import.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message ?? "Terjadi kesalahan saat mengimpor.");
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setPelatihanId("");
    setFile(null);
    setPreviewData(null);
    setSummary(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-850">Import Peserta Pelatihan</h3>
              <p className="text-xs text-stone-500">Mendaftarkan banyak peserta sekaligus menggunakan Excel</p>
            </div>
          </div>
          <button onClick={() => { onClose(); resetModal(); }} className="text-stone-400 hover:text-stone-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex gap-3 text-sm text-stone-600">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800">Petunjuk Import:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                <li>Unduh template Excel yang sudah disediakan.</li>
                <li>Isi kolom **NIK**, **Nilai**, dan **Status** (Aktif / Lulus / Tidak Lulus).</li>
                <li>Sistem akan mencari nama peserta berdasarkan **NIK** yang terdaftar di database Dinas Tenaga Kerja.</li>
                <li>Hanya baris dengan status **Valid** yang akan dimasukkan ke database saat Anda menekan tombol Import.</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Step 1: Pelatihan Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                1. Pilih Program Pelatihan Tujuan <span className="text-red-500">*</span>
              </label>
              <select
                value={pelatihanId}
                disabled={previewData !== null || loading}
                onChange={(e) => setPelatihanId(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white disabled:opacity-60"
              >
                <option value="">-- Pilih Program Pelatihan --</option>
                {pelatihans.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama_pelatihan}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Upload Input */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                2. Pilih File Excel (.xlsx) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx"
                  disabled={!pelatihanId || previewData !== null || loading}
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  className={`w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm flex items-center gap-2 cursor-pointer transition select-none bg-stone-50 hover:bg-stone-100 text-stone-700 font-medium ${(!pelatihanId || previewData !== null || loading) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Upload size={16} />
                  {file ? file.name : "Pilih File..."}
                </label>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">Membaca dan memvalidasi data Excel...</p>
            </div>
          )}

          {/* Preview Panel */}
          {previewData && summary && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-50 p-4 border border-stone-200 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Hasil Analisis File: "{file?.name}"</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Silakan periksa detail validasi di bawah sebelum melakukan import.</p>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                    Total: {summary.total}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                    Valid: {summary.valid}
                  </span>
                  <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-100">
                    Error: {summary.error}
                  </span>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50 sticky top-0">
                    <tr>
                      {["No", "NIK", "Nama", "Nilai", "Status", "Keterangan"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider bg-stone-50">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-150 text-xs">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className={row.is_valid ? "bg-emerald-50/20 hover:bg-emerald-50/30" : "bg-red-50/20 hover:bg-red-50/30"}>
                        <td className="px-4 py-3 text-stone-500 font-medium">{idx + 1}</td>
                        <td className="px-4 py-3 text-stone-850 font-semibold">{row.nik || "—"}</td>
                        <td className="px-4 py-3 text-stone-800">{row.nama || "—"}</td>
                        <td className="px-4 py-3 text-stone-800 font-medium">{row.nilai !== null ? row.nilai : "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${row.status_peserta === "lulus" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : row.status_peserta === "tidak_lulus" ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                            {row.status_peserta === "aktif" ? "Aktif" : row.status_peserta === "lulus" ? "Lulus" : "Tidak Lulus"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {row.is_valid ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle size={13} /> Valid
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertTriangle size={13} /> {row.error_message}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex justify-between items-center bg-stone-50">
          <button
            type="button"
            onClick={() => { onClose(); resetModal(); }}
            className="border border-stone-300 text-stone-700 hover:bg-stone-100 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Batal
          </button>
          <div className="flex gap-2">
            {previewData && (
              <button
                type="button"
                onClick={resetModal}
                className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Ulangi Upload
              </button>
            )}
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !previewData || !summary || summary.valid === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {importing ? "Mengimpor..." : `Import Sekarang (${summary?.valid ?? 0} data)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
