import { UserPlus, BookOpen, Award, CheckCircle } from "lucide-react";

/**
 * StatsGrid - Grid kartu statistik di bagian atas dashboard
 * Menampilkan 3 stat card + 1 aktivitas card menggunakan data asli dari API
 */
export function StatsGrid({ stats, dataPeserta }) {
  if (!stats) return null;

  const dynamicStatsData = [
    {
      title: "Total Pelatihan",
      description: stats.total_pelatihan + " program pelatihan",
      value: stats.total_pelatihan,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Total Peserta",
      description: stats.total_peserta + " orang terdaftar",
      value: stats.total_peserta,
      icon: UserPlus,
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Peserta Lulus",
      description: stats.total_lulus + " orang lulus",
      value: stats.total_lulus,
      icon: CheckCircle,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Sertifikasi Terbit",
      description: stats.total_sertifikat + " sertifikat",
      value: stats.total_sertifikat,
      icon: Award,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Stat Cards */}
      {dynamicStatsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex items-center h-full shadow-sm"
          >
            <div className={`p-4 rounded-full mr-4 ${stat.bg} ${stat.color}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-1">
                {stat.value}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}