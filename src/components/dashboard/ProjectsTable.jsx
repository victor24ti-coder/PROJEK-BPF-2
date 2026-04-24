import { MoreVertical, Palette, TrendingUp, Bug, Smartphone, Tag, ShoppingBag } from "lucide-react";
import { projectsData } from "../data/dashboardData";

const iconComponents = {
  palette: Palette,
  "chart-line": TrendingUp,
  bug: Bug,
  smartphone: Smartphone,
  tag: Tag,
  "shopping-bag": ShoppingBag,
};

/**
 * ProgressBar - Komponen progress bar sederhana
 */
function ProgressBar({ value }) {
  return (
    <div className="w-32 h-2 bg-gray-200 dark:bg-stone-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-800 dark:bg-stone-300 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/**
 * Avatar - Foto atau inisial avatar
 */
function Avatar({ src, name, colorClass }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full border-2 border-white dark:border-stone-800 object-cover"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }
  return (
    <div
      className={`w-8 h-8 rounded-full border-2 border-white dark:border-stone-800 flex items-center justify-center text-white text-xs font-semibold ${colorClass}`}
    >
      {name.charAt(0)}
    </div>
  );
}

/**
 * ProjectsTable - Tabel daftar proyek dengan info anggota, budget, dan progress
 */
export function ProjectsTable() {
  return (
    <div className="bg-white dark:bg-blue-800 border border-gray-200 dark:border-stone-700 rounded-xl shadow-sm mb-8">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-stone-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Pelatihan</h2>
          <div className="text-sm text-gray-500 dark:text-stone-400 flex items-center mt-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
            30 done this month
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-stone-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 dark:text-stone-400 uppercase tracking-wider">
                Pelatihan 
              </th>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 dark:text-stone-400 uppercase tracking-wider">
                Instruktur 
              </th>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 dark:text-stone-400 uppercase tracking-wider">
                Peserta 
              </th>
              <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 dark:text-stone-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-blue-800 divide-y divide-gray-200 dark:divide-stone-700">
            {projectsData.map((project) => {
              const Icon = iconComponents[project.icon] || Palette;
              return (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 dark:hover:bg-stone-700/50 transition-colors"
                >
                  {/* Company */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white ${project.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-normal text-gray-900 dark:text-white text-sm">
                        {project.name}
                      </span>
                    </div>
                  </td>

                  {/* Members */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2">
                      {project.members.map((member) => (
                        <Avatar
                          key={member.id}
                          src={member.avatar}
                          name={member.name}
                          colorClass={member.color}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {project.budget}
                  </td>

                  {/* Completion */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-stone-400">
                        {project.completion}%
                      </span>
                      <ProgressBar value={project.completion} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}