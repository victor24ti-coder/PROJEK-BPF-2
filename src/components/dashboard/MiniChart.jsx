import { BarChart, Bar, ResponsiveContainer, XAxis, Cell, Tooltip } from "recharts";

/**
 * MiniChart - Bar chart mini untuk stats card
 * @param {Object} props
 * @param {number[]} props.data - Array angka data
 * @param {string[]} props.labels - Label untuk setiap bar
 * @param {string} [props.activeColor] - Warna bar aktif (default biru)
 */
export function MiniChart({ data, labels, activeColor = "#1E88E5" }) {
  const maxValue = Math.max(...data);

  const chartData = data.map((value, index) => ({
    label: labels[index],
    value,
    isActive: value === maxValue,
  }));

  return (
    <div className="mt-4">
      <div className="h-24 mb-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={false} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
                padding: "4px 8px",
              }}
              formatter={(value) => [value, "Value"]}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} strokeWidth={0}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isActive ? activeColor : "#1E88E5"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        {labels.map((label, index) => (
          <span key={index} className="text-center flex-1">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}