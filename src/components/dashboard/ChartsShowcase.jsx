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
import { areaChartData, lineChartData, pieChartData, barChartData } from "../data/dashboardData";

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
 * ChartsShowcase - Grid 4 chart: Area, Line, Pie, Bar
 */
export function ChartsShowcase() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Area Chart */}
      <ChartCard title="Data Pelatihan & Peserta" subtitle="Statistik bulanan">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0c0a09" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0c0a09" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
            <Legend />
            <Area type="monotone" dataKey="sales" stroke="#1E88E5" strokeWidth={2} fill="url(#colorSales)" name="Pelatihan" />
            <Area type="monotone" dataKey="expenses" stroke="#1565C0" strokeWidth={2} fill="url(#colorExpenses)" name="Peserta" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Line Chart */}
      <ChartCard title="Aktivitas Sistem" subtitle="Aktivitas mingguan">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#1E88E5" strokeWidth={3} dot={{ fill: "#1E88E5", r: 4 }} activeDot={{ r: 6, fill: "#fff", stroke: "#1E88E5", strokeWidth: 2 }} name="Aktivitas" />
            <Line type="monotone" dataKey="sessions" stroke="#1565C0" strokeWidth={3} dot={{ fill: "#1565C0", r: 4 }} activeDot={{ r: 6, fill: "#fff", stroke: "#1565C0", strokeWidth: 2 }} name="Laporan" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie Chart */}
      <ChartCard title="Distribusi Peserta" subtitle="Berdasarkan status kerja">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bar Chart */}
      <ChartCard title="Kinerja Pelatihan" subtitle="Perbandingan peserta dan kelulusan">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
            <Legend />
            <Bar dataKey="revenue" fill="#1E88E5" radius={[4, 4, 0, 0]} name="Peserta" />
            <Bar dataKey="profit" fill="#1565C0" radius={[4, 4, 0, 0]} name="Lulus" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}