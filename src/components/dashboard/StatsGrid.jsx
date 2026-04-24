import { Bell, ShoppingCart, CreditCard, Plus, Package } from "lucide-react";
import { MiniChart } from "./MiniChart";
import { statsData, ordersOverview } from "../data/dashboardData";

const iconMap = {
  bell: Bell,
  "shopping-cart": ShoppingCart,
  "credit-card": CreditCard,
  plus: Plus,
  package: Package,
};

/**
 * StatsGrid - Grid kartu statistik di bagian atas dashboard
 * Menampilkan 3 stat card + 1 orders overview card
 */
export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Stat Cards */}
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex flex-col h-full shadow-sm"
        >
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-1">
              {stat.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {stat.description}
            </p>
          </div>

          <div className="flex-1 mb-4">
            <MiniChart
              data={stat.chartData}
              labels={stat.chartLabels}
              activeColor="#3b82f6"
            />
          </div>

          <div className="flex items-center text-xs text-stone-500 dark:text-stone-400">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2" />
            {stat.lastUpdate}
          </div>
        </div>
      ))}

      {/* Orders Overview Card */}
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex flex-col h-full shadow-sm">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-1">
            Aktivitas Terbaru
          </h3>
        </div>

        <div className="flex-1 mb-4">
          <div className="space-y-4">
            {ordersOverview.slice(0, 2).map((order, index) => {
              const Icon = iconMap[order.icon];
              return (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {Icon && <Icon className={`${order.iconColor} w-4 h-4`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal text-stone-900 dark:text-white truncate">
                      {order.title}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {order.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full font-normal">
            +24% this month
          </span>
        </div>
      </div>
    </div>
  );
}