import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { lpkPortalAPI } from "../../../../services/api";
import {
  ArrowLeft,
  Save,
  BookOpen,
} from "lucide-react";



export default function Create() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_pelatihan: "",
    jenis_pelatihan: "",
    jurusan: "",
    deskripsi: "",
    kuota: "",
    status: "Dibuka",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

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
      await lpkPortalAPI.pelatihan.create(form);
      alert("Pelatihan berhasil ditambahkan.");
      navigate("/lpk/pelatihan");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Gagal menambahkan data pelatihan. Pastikan data terisi dengan benar.");
    } finally {
      setLoading(false);
    }
};
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-stone-800">

            Tambah Pelatihan

          </h1>

          <p className="text-stone-500 mt-2">

            Tambahkan data pelatihan baru.

          </p>

        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-stone-100"
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

        <div className="border-b px-6 py-5 flex items-center gap-3">

          <BookOpen className="text-blue-600"/>

          <h2 className="font-semibold text-lg">

            Form Pelatihan

          </h2>

        </div>

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
              required
              className="w-full border rounded-lg px-4 py-3 focus:ring focus:ring-blue-200"
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
              required
              className="w-full border rounded-lg px-4 py-3"
            >

              <option value="">Pilih Jenis</option>

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

          {/* Tanggal Mulai */}

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

          {/* Tanggal Selesai */}

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

              <option>Dibuka</option>

              <option>Aktif</option>

              <option>Selesai</option>

              <option>Ditutup</option>

            </select>

          </div>

          {/* Deskripsi */}

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium">

              Deskripsi

            </label>

            <textarea
              rows={5}
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />

          </div>

        </div>

        {/* Footer */}

        <div className="border-t px-6 py-5 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border rounded-lg hover:bg-stone-100"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 flex items-center gap-2"
          >

            <Save size={18} />

            {loading ? "Menyimpan..." : "Simpan"}

          </button>

        </div>

      </form>

    </div>
  );
}