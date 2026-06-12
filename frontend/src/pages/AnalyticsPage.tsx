import React, { useEffect, useState } from "react";
import { useFootprintStore } from "../store/footprintStore";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  transportation: "#3b82f6",
  energy: "#f59e0b",
  food: "#10b981",
  shopping: "#8b5cf6",
};

/** Analytics page with detailed charts and statistics */
export default function AnalyticsPage(): React.ReactElement {
  const {
    breakdownData,
    trendData,
    fetchBreakdown,
    fetchTrend,
    statsData,
    fetchStats,
  } = useFootprintStore();
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchBreakdown(period);
    fetchTrend(period);
    fetchStats();
  }, [period, fetchBreakdown, fetchTrend, fetchStats]);

  const pieData =
    breakdownData?.categories.map((c) => ({
      name: c.category,
      value: Math.round(c.total * 100) / 100,
    })) || [];
  const lineData =
    trendData?.dataPoints.map((dp) => ({
      date: dp.date.slice(5),
      total: dp.total,
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            Deep dive into your emission patterns
          </p>
        </div>
        <div
          className="flex gap-2"
          role="group"
          aria-label="Time period selector"
        >
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${period === p ? "bg-primary-500 text-white shadow-lg" : "bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-400 border border-dark-200 dark:border-dark-600 hover:bg-dark-50 dark:hover:bg-dark-700"}`}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card text-center">
          <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
            Total Emissions
          </p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">
            {statsData?.totalEmissions?.toFixed(1) || "0"}
          </p>
          <p className="text-xs text-dark-400">kg CO₂</p>
        </div>
        <div className="glass-card text-center">
          <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
            Monthly
          </p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">
            {statsData?.monthlyEmissions?.toFixed(1) || "0"}
          </p>
          <p className="text-xs text-dark-400">kg CO₂</p>
        </div>
        <div className="glass-card text-center">
          <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
            Daily Avg
          </p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white mt-1">
            {statsData?.dailyAverage?.toFixed(1) || "0"}
          </p>
          <p className="text-xs text-dark-400">kg CO₂/day</p>
        </div>
        <div className="glass-card text-center">
          <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">
            vs Average
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${(statsData?.comparisonToAverage || 0) <= 0 ? "text-green-600" : "text-red-500"}`}
          >
            {(statsData?.comparisonToAverage || 0) > 0 ? "+" : ""}
            {statsData?.comparisonToAverage?.toFixed(1) || "0"}%
          </p>
          <p className="text-xs text-dark-400">
            {(statsData?.comparisonToAverage || 0) <= 0
              ? "Below avg 🎉"
              : "Above avg"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Emissions Over Time
          </h2>
          <div className="h-72">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="text-dark-200 dark:text-dark-700"
                  />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="CO₂ (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                No data for this period
              </div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Category Distribution
          </h2>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${(name as string).slice(0, 5)} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toFixed(1)} kg CO₂`,
                      "",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                No data for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
