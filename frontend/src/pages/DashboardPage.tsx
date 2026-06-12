import React, { useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Flame,
  Zap,
  Leaf,
} from "lucide-react";
import { useFootprintStore } from "../store/footprintStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  transportation: "#3b82f6",
  energy: "#f59e0b",
  food: "#10b981",
  shopping: "#8b5cf6",
};
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  transportation: <Activity className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  food: <Leaf className="w-4 h-4" />,
  shopping: <Flame className="w-4 h-4" />,
};

/** Dashboard page — main hub showing stats, charts, activities, and recommendations */
export default function DashboardPage(): React.ReactElement {
  const {
    statsData,
    breakdownData,
    trendData,
    todayRecords,
    recommendationsList,
    fetchAll,
  } = useFootprintStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const statCards = [
    {
      label: "Monthly Emissions",
      value: `${statsData?.monthlyEmissions?.toFixed(1) || "0"} kg`,
      icon: <TrendingDown className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
      change: statsData?.comparisonToAverage,
    },
    {
      label: "Daily Average",
      value: `${statsData?.dailyAverage?.toFixed(1) || "0"} kg`,
      icon: <Activity className="w-5 h-5" />,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Activities Logged",
      value: String(statsData?.totalActivities || 0),
      icon: <Flame className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Active Streak",
      value: `${statsData?.streak || 0} days`,
      icon: <Zap className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const pieData =
    breakdownData?.categories.map((c) => ({
      name: c.category,
      value: c.total,
      percentage: c.percentage,
    })) || [];
  const trendChartData =
    trendData?.dataPoints.map((dp) => ({
      date: dp.date.slice(5),
      total: dp.total,
      ...dp.categories,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Track your environmental impact at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card"
            aria-label={`${card.label}: ${card.value}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
                aria-hidden="true"
              >
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-dark-900 dark:text-white">
              {card.value}
            </div>
            {card.change !== undefined && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs font-medium ${card.change <= 0 ? "text-green-600" : "text-red-500"}`}
              >
                {card.change <= 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                <span>{Math.abs(card.change).toFixed(1)}% vs average</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass-card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Emissions Trend
          </h2>
          <div className="h-64">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-dark-200 dark:text-dark-700"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="currentColor"
                    className="text-dark-400"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="currentColor"
                    className="text-dark-400"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="transportation"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[0, 0, 0, 0]}
                    name="Transport"
                  />
                  <Bar
                    dataKey="energy"
                    stackId="a"
                    fill="#f59e0b"
                    name="Energy"
                  />
                  <Bar dataKey="food" stackId="a" fill="#10b981" name="Food" />
                  <Bar
                    dataKey="shopping"
                    stackId="a"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    name="Shopping"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-dark-400">
                <p>Log your first activity to see trends</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Category Breakdown
          </h2>
          <div className="h-48">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toFixed(1)} kg CO₂`,
                      "",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                No data yet
              </div>
            )}
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] }}
                    aria-hidden="true"
                  />
                  <span className="capitalize text-dark-600 dark:text-dark-400">
                    {item.name}
                  </span>
                </div>
                <span className="font-medium text-dark-900 dark:text-white">
                  {item.percentage?.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Today&apos;s Activities
          </h2>
          {todayRecords.length > 0 ? (
            <div className="space-y-3">
              {todayRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{
                        backgroundColor: CATEGORY_COLORS[record.category],
                      }}
                    >
                      {CATEGORY_ICONS[record.category]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-800 dark:text-dark-200 capitalize">
                        {record.activityType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-dark-400">
                        {record.value} {record.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-dark-900 dark:text-white">
                    {record.co2Equivalent.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-8">
              No activities logged today. Start tracking!
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Top Recommendations
          </h2>
          {recommendationsList.length > 0 ? (
            <div className="space-y-3">
              {recommendationsList.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-dark-800 dark:text-dark-200">
                      {rec.action}
                    </p>
                    <span
                      className={`badge ${rec.difficulty === "easy" ? "badge-easy" : rec.difficulty === "medium" ? "badge-medium" : "badge-hard"}`}
                    >
                      {rec.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                    Save ~{rec.impact} kg CO₂/month
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-8">
              Log some activities to get personalized tips
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
