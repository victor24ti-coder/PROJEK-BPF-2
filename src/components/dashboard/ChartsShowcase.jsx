import {
  AreaChart, Area,
  LineChart, Line,
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * ChartCard - Wrapper card untuk setiap chart
 */
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl shadow-sm">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-stone-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="px-4 pb-6">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "12px",
};

/**
 * ChartsShowcase - Grid chart
 */
export function ChartsShowcase({ grafik }) {
  if (!grafik) return null;

  const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

      {/* Bar Chart */}
      <ChartCard title="Peserta per Pelatihan" subtitle="Jumlah peserta di tiap program">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={grafik.peserta_per_pelatihan} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="nama_pelatihan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6b7280" }} width={100} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="peserta" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Peserta" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie Chart */}
      <ChartCard title="Tingkat Kelulusan" subtitle="Distribusi kelulusan peserta">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Pie
              data={grafik.tingkat_kelulusan}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {grafik.tingkat_kelulusan.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Area Chart / Line Chart */}
      <ChartCard title="Penerbitan Sertifikat" subtitle="Jumlah sertifikat per bulan">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={grafik.sertifikat_per_bulan} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSertifikat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area type="monotone" dataKey="jumlah" stroke="#10B981" strokeWidth={2} fill="url(#colorSertifikat)" name="Sertifikat" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}