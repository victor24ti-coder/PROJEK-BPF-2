import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { lpkPortalAPI } from "../../../../services/api";
import {
  ArrowLeft,
  Save,
  BookOpen,
} from "lucide-react";

export default function Edit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [form, setForm] = useState({
    nama_pelatihan: "",
    jenis_pelatihan: "",
    jurusan: "",
    deskripsi: "",
    kuota: "",
    status: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  useEffect(() => {
    setFetchLoading(true);
    lpkPortalAPI.pelatihan.getById(id)
    .then(res => {
      setForm(res.data.data);
      setFetchLoading(false);
    })
    .catch(err => {
      console.error(err);
      alert("Gagal memuat data pelatihan.");
      setFetchLoading(false);
    });
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await lpkPortalAPI.pelatihan.update(id, form);
      alert("Pelatihan berhasil diperbarui.");
      navigate("/lpk/pelatihan");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  if(fetchLoading){

    return(

      <div className="flex justify-center items-center h-[70vh]">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>

          <p className="mt-4 text-stone-500">

            Memuat data...

          </p>

        </div>

      </div>

    );

  }


return (

    <div className="space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-stone-800">

            Edit Pelatihan

          </h1>

          <p className="text-stone-500 mt-2">

            Perbarui informasi pelatihan.

          </p>

        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-stone-100 transition"
        >

          <ArrowLeft size={18} />

          Kembali

        </button>

      </div>

      {/* Card */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border shadow-sm"
      >

        {/* Header Card */}

        <div className="border-b px-6 py-5 flex items-center gap-3">

          <BookOpen className="text-blue-600" />

          <h2 className="font-semibold text-lg">

            Form Edit Pelatihan

          </h2>

        </div>

        {/* Body */}

        <div className="grid md:grid-cols-2 gap-6 p-6">

          {/* Nama */}

          <div>

            <label className="block mb-2 font-medium">

              Nama Pelatihan

            </label>

            <input
              type="text"
              name="nama_pelatihan"
              value={form.nama_pelatihan}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-300 outline-none"
              required
            />

          </div>

          {/* Jenis */}

          <div>

            <label className="block mb-2 font-medium">

              Jenis Pelatihan

            </label>

            <select
              name="jenis_pelatihan"
              value={form.jenis_pelatihan}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >

              <option value="">

                Pilih Jenis

              </option>

              <option value="Online">

                Online

              </option>

              <option value="Offline">

                Offline

              </option>

              <option value="Hybrid">

                Hybrid

              </option>

            </select>

          </div>

          {/* Jurusan */}

          <div>

            <label className="block mb-2 font-medium">

              Jurusan

            </label>

            <input
              type="text"
              name="jurusan"
              value={form.jurusan}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

          </div>

          {/* Kuota */}

          <div>

            <label className="block mb-2 font-medium">

              Kuota

            </label>

            <input
              type="number"
              name="kuota"
              value={form.kuota}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

          </div>

          {/* Mulai */}

          <div>

            <label className="block mb-2 font-medium">

              Tanggal Mulai

            </label>

            <input
              type="date"
              name="tanggal_mulai"
              value={form.tanggal_mulai}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

          </div>

          {/* Selesai */}

          <div>

            <label className="block mb-2 font-medium">

              Tanggal Selesai

            </label>

            <input
              type="date"
              name="tanggal_selesai"
              value={form.tanggal_selesai}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

          </div>

          {/* Status */}

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium">

              Status

            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >

              <option value="dibuka">

                Dibuka

              </option>

              <option value="aktif">

                Aktif

              </option>

              <option value="selesai">

                Selesai

              </option>

              <option value="ditutup">

                Ditutup

              </option>

            </select>

          </div>

          {/* Deskripsi */}

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium">

              Deskripsi

            </label>

            <textarea
              rows="5"
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 resize-none"
            />

          </div>

        </div>
                {/* Footer */}

        <div className="border-t px-6 py-5 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border rounded-lg hover:bg-stone-100 transition"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 flex items-center gap-2 transition disabled:opacity-50"
          >

            <Save size={18} />

            {loading ? "Menyimpan..." : "Update Pelatihan"}

          </button>

        </div>

      </form>

      {/* Informasi */}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

        <h3 className="font-semibold text-blue-700">

          Informasi

        </h3>

        <ul className="mt-3 text-sm text-blue-700 space-y-2 list-disc list-inside">

          <li>
            Pastikan nama pelatihan sudah sesuai.
          </li>

          <li>
            Kuota tidak boleh lebih kecil dari jumlah peserta yang sudah terdaftar.
          </li>

          <li>
            Perubahan akan langsung tersimpan setelah menekan tombol
            <strong> Update Pelatihan</strong>.
          </li>

        </ul>

      </div>

    </div>

  );

}