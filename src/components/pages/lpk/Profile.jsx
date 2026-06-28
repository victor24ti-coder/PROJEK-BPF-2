import { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BadgeCheck,
  BookOpen,
  Users,
} from "lucide-react";
import { authAPI } from "../../../services/api";

export default function Profile() {
  const [profile, setProfile] = useState({
    nama_lpk: "",
    email: "",
    kontak: "",
    alamat: "",
    bidang_keahlian: "",
    status_aktif: "Aktif",
    totalPelatihan: 0,
    totalPeserta: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authAPI.getCurrentUser()
      .then((res) => {
        const user = res.data.user;
        const lpk = user?.lpk;

        // Hitung total pelatihan dan peserta secara dinamis
        const totalPelatihan = lpk?.pelatihan?.length || 0;
        const totalPeserta = lpk?.pelatihan?.reduce((acc, curr) => acc + (curr.peserta?.length || 0), 0);

        setProfile({
          nama_lpk: lpk?.nama_lpk || user?.nama || "-",
          email: lpk?.email || user?.email || "-",
          kontak: lpk?.kontak || "-",
          alamat: lpk?.alamat || "-",
          bidang_keahlian: lpk?.bidang_keahlian || "-",
          status_aktif: lpk?.status_aktif ? "Aktif" : "Tidak Aktif",
          totalPelatihan,
          totalPeserta,
        });
      })
      .catch((err) => {
        console.error("Gagal memuat profil LPK:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-stone-500">Memuat profil lembaga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow">

        <div className="flex items-center gap-6">

          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">

            <Building2 size={50} />

          </div>

          <div>

            <h1 className="text-3xl font-bold">

              {profile.nama_lpk}

            </h1>

            <p className="text-blue-100 mt-2">

              Profil Lembaga Pelatihan Kerja

            </p>

            <span className="inline-flex mt-4 px-4 py-1 rounded-full bg-green-500 text-sm">

              {profile.status_aktif}

            </span>

          </div>

        </div>

      </div>

      {/* Statistik */}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow border p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-gray-500">

                Total Pelatihan

              </p>

              <h2 className="text-4xl font-bold mt-2">

                {profile.totalPelatihan}

              </h2>

            </div>

            <div className="bg-blue-100 p-4 rounded-xl">

              <BookOpen className="text-blue-600"/>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-xl shadow border p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-gray-500">

                Total Peserta

              </p>

              <h2 className="text-4xl font-bold mt-2">

                {profile.totalPeserta}

              </h2>

            </div>

            <div className="bg-green-100 p-4 rounded-xl">

              <Users className="text-green-600"/>

            </div>

          </div>

        </div>

      </div>

      {/* Detail */}

      <div className="bg-white rounded-xl shadow border">

        <div className="border-b px-6 py-4">

          <h2 className="font-semibold text-lg">

            Informasi LPK

          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">

          <div className="space-y-6">

            <div className="flex gap-4">

              <Building2 className="text-blue-600"/>

              <div>

                <p className="text-sm text-gray-500">

                  Nama LPK

                </p>

                <h3 className="font-semibold">

                  {profile.nama_lpk}

                </h3>

              </div>

            </div>

            <div className="flex gap-4">

              <Mail className="text-blue-600"/>

              <div>

                <p className="text-sm text-gray-500">

                  Email

                </p>

                <h3>

                  {profile.email}

                </h3>

              </div>

            </div>

            <div className="flex gap-4">

              <Phone className="text-blue-600"/>

              <div>

                <p className="text-sm text-gray-500">

                  Kontak

                </p>

                <h3>

                  {profile.kontak}

                </h3>

              </div>

            </div>

          </div>

          <div className="space-y-6">

            <div className="flex gap-4">

              <MapPin className="text-blue-600"/>

              <div>

                <p className="text-sm text-gray-500">

                  Alamat

                </p>

                <h3>

                  {profile.alamat}

                </h3>

              </div>

            </div>

            <div className="flex gap-4">

              <Briefcase className="text-blue-600"/>

              <div>

                <p className="text-sm text-gray-500">

                  Bidang Keahlian

                </p>

                <h3>

                  {profile.bidang_keahlian}

                </h3>

              </div>

            </div>

            <div className="flex gap-4">

              <BadgeCheck className="text-blue-600"/>

              <div>

                <p className="text-sm text-gray-500">

                  Status

                </p>

                <h3 className="text-green-600 font-semibold">

                  {profile.status_aktif}

                </h3>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}