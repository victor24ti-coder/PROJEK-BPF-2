import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  BadgeCheck,
  Clock,
  Building2,
} from "lucide-react";
import { lpkPortalAPI } from "../../../../services/api";

export default function Detail() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [pelatihan, setPelatihan] = useState(null);

  useEffect(() => {
    setLoading(true);
    lpkPortalAPI.pelatihan.getById(id)
      .then((res) => {
        setPelatihan(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal memuat detail pelatihan.");
        setLoading(false);
      });
  }, [id]);

  if(loading){

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

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold text-stone-800">

            Detail Pelatihan

          </h1>

          <p className="text-stone-500 mt-2">

            Informasi lengkap mengenai pelatihan.

          </p>

        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-stone-100 transition"
        >

          <ArrowLeft size={18}/>

          Kembali

        </button>

      </div>

      {/* Hero */}

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow">

        <div className="flex justify-between items-center">

          <div>

            <h2 className="text-3xl font-bold">

              {pelatihan.nama_pelatihan}

            </h2>

            <p className="text-blue-100 mt-3">

              {pelatihan.deskripsi}

            </p>

            <span className="inline-flex mt-5 px-4 py-1 rounded-full bg-green-500">

              {pelatihan.status}

            </span>

          </div>

          <BookOpen
            size={90}
            className="hidden lg:block text-blue-200"
          />

        </div>

      </div>

      {/* Statistik */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-stone-500">

                Kuota

              </p>

              <h2 className="text-4xl font-bold mt-3">

                {pelatihan.kuota}

              </h2>

            </div>

            <div className="bg-blue-100 p-4 rounded-xl">

              <Users
                className="text-blue-600"
              />

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-stone-500">

                Peserta

              </p>

              <h2 className="text-4xl font-bold mt-3">

                {pelatihan.peserta?.length || 0}

              </h2>

            </div>

            <div className="bg-green-100 p-4 rounded-xl">

              <GraduationCap
                className="text-green-600"
              />

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-stone-500">

                Status

              </p>

              <h2 className="text-xl font-bold mt-4">

                {pelatihan.status}

              </h2>

            </div>

            <div className="bg-orange-100 p-4 rounded-xl">

              <BadgeCheck
                className="text-orange-600"
              />

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-stone-500">

                Jenis

              </p>

              <h2 className="text-xl font-bold mt-4">

                {pelatihan.jenis_pelatihan}

              </h2>

            </div>

            <div className="bg-purple-100 p-4 rounded-xl">

              <Clock
                className="text-purple-600"
              />

            </div>

          </div>

        </div>

      </div>
            {/* Detail Informasi */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Informasi Pelatihan */}

        <div className="bg-white rounded-xl border shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="font-semibold text-lg">

              Informasi Pelatihan

            </h2>

          </div>

          <div className="p-6 space-y-6">

            <div className="flex items-start gap-4">

              <BookOpen className="text-blue-600 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Nama Pelatihan

                </p>

                <h3 className="font-semibold">

                  {pelatihan.nama_pelatihan}

                </h3>

              </div>

            </div>

            <div className="flex items-start gap-4">

              <BadgeCheck className="text-green-600 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Status

                </p>

                <h3 className="font-semibold">

                  {pelatihan.status}

                </h3>

              </div>

            </div>

            <div className="flex items-start gap-4">

              <GraduationCap className="text-orange-500 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Jurusan

                </p>

                <h3 className="font-semibold">

                  {pelatihan.jurusan}

                </h3>

              </div>

            </div>

            <div className="flex items-start gap-4">

              <Users className="text-purple-600 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Kuota Peserta

                </p>

                <h3 className="font-semibold">

                  {pelatihan.peserta?.length || 0} / {pelatihan.kuota}

                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* Informasi Tambahan */}

        <div className="bg-white rounded-xl border shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="font-semibold text-lg">

              Informasi Tambahan

            </h2>

          </div>

          <div className="p-6 space-y-6">

            <div className="flex items-start gap-4">

              <Building2 className="text-blue-600 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Lokasi

                </p>

                <h3 className="font-semibold">

                  {pelatihan.lpk?.nama_lpk || "-"}

                </h3>

              </div>

            </div>

            <div className="flex items-start gap-4">

              <Users className="text-green-600 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Instruktur

                </p>

                <h3 className="font-semibold">

                  -

                </h3>

              </div>

            </div>

            <div className="flex items-start gap-4">

              <Calendar className="text-orange-500 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Tanggal Mulai

                </p>

                <h3 className="font-semibold">

                  {pelatihan.tanggal_mulai}

                </h3>

              </div>

            </div>

            <div className="flex items-start gap-4">

              <Calendar className="text-red-500 mt-1"/>

              <div>

                <p className="text-sm text-stone-500">

                  Tanggal Selesai

                </p>

                <h3 className="font-semibold">

                  {pelatihan.tanggal_selesai}

                </h3>

              </div>

            </div>

          </div>

        </div>

      </div>
            {/* Deskripsi */}

      <div className="bg-white rounded-xl border shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="font-semibold text-lg">

            Deskripsi Pelatihan

          </h2>

        </div>

        <div className="p-6">

          <p className="text-stone-600 leading-8">

            {pelatihan.deskripsi}

          </p>

        </div>

      </div>

      {/* Progress Kuota */}

      <div className="bg-white rounded-xl border shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="font-semibold text-lg">

            Progress Peserta

          </h2>

        </div>

        <div className="p-6">

          <div className="flex justify-between mb-3">

            <span className="text-stone-600">

              Peserta Terdaftar

            </span>

            <span className="font-semibold">

              {pelatihan.peserta?.length || 0} / {pelatihan.kuota}

            </span>

          </div>

          <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">

            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${((pelatihan.peserta?.length || 0) / (parseInt(pelatihan.kuota) || 1)) * 100}%`,
              }}
            ></div>

          </div>

          <p className="mt-3 text-sm text-stone-500">

            {Math.round(((pelatihan.peserta?.length || 0) / (parseInt(pelatihan.kuota) || 1)) * 100)}%
            kuota telah terisi.

          </p>

        </div>

      </div>

      {/* Action */}

      <div className="bg-white rounded-xl border shadow-sm p-6">

        <div className="flex flex-wrap justify-end gap-4">

          <button
            onClick={() => navigate("/lpk/peserta-pelatihan")}
            className="px-5 py-3 rounded-lg border hover:bg-stone-100 transition"
          >

            Lihat Peserta

          </button>

          <button
            onClick={() => navigate(`/lpk/pelatihan/edit/${pelatihan.id}`)}
            className="px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition"
          >

            Edit Pelatihan

          </button>

          <button
            onClick={() => navigate("/lpk/pelatihan")}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          >

            Kembali

          </button>

        </div>

      </div>

    </div>

  );

}