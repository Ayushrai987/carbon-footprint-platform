/**
 * @module services/stats.service
 * @description Statistics and analytics service.
 * Computes emissions summaries, breakdowns, trends, and user comparisons.
 */

import { getDatabase } from '../config/database';
import { AVERAGE_MONTHLY_EMISSIONS, AVERAGE_CATEGORY_EMISSIONS } from '../config/constants';
import {
  EmissionCategory,
  StatsResponse,
  BreakdownResponse,
  TrendResponse,
  ComparisonResponse,
} from '../types';

/**
 * Get summary statistics for a user's emissions.
 * Includes total, monthly, daily average, streak, and comparison to average.
 *
 * @param userId - User ID
 * @returns Summary statistics object
 */
export function getSummary(userId: number): StatsResponse {
  const db = getDatabase();

  const monthlyRow = db
    .prepare(
      `SELECT COALESCE(SUM(co2_equivalent), 0) as total, COUNT(*) as count
       FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-30 days')`,
    )
    .get(userId) as { total: number; count: number };

  const totalRow = db
    .prepare(
      `SELECT COALESCE(SUM(co2_equivalent), 0) as total
       FROM footprint_records WHERE user_id = ?`,
    )
    .get(userId) as { total: number };

  const streakRow = db
    .prepare(
      `SELECT COUNT(DISTINCT date) as streak
       FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-30 days')`,
    )
    .get(userId) as { streak: number };

  const monthlyEmissions = Math.round(monthlyRow.total * 100) / 100;
  const dailyAverage = monthlyEmissions > 0 ? Math.round((monthlyEmissions / 30) * 100) / 100 : 0;
  const comparisonToAverage =
    AVERAGE_MONTHLY_EMISSIONS > 0
      ? Math.round(((monthlyEmissions - AVERAGE_MONTHLY_EMISSIONS) / AVERAGE_MONTHLY_EMISSIONS) * 10000) / 100
      : 0;

  return {
    totalEmissions: Math.round(totalRow.total * 100) / 100,
    monthlyEmissions,
    dailyAverage,
    comparisonToAverage,
    streak: streakRow.streak,
    totalActivities: monthlyRow.count,
  };
}

/**
 * Get emissions breakdown by category for a given period.
 *
 * @param userId - User ID
 * @param period - Time period ('week', 'month', 'year')
 * @returns Category breakdown with percentages
 */
export function getBreakdown(userId: number, period: string): BreakdownResponse {
  const db = getDatabase();
  const dateFilter = getDateFilter(period);

  const rows = db
    .prepare(
      `SELECT category, SUM(co2_equivalent) as total, COUNT(*) as count
       FROM footprint_records
       WHERE user_id = ? AND date >= ${dateFilter}
       GROUP BY category
       ORDER BY total DESC`,
    )
    .all(userId) as Array<{ category: EmissionCategory; total: number; count: number }>;

  const totalEmissions = rows.reduce((sum, row) => sum + row.total, 0);

  const categories = rows.map((row) => ({
    category: row.category,
    total: Math.round(row.total * 100) / 100,
    percentage: totalEmissions > 0 ? Math.round((row.total / totalEmissions) * 10000) / 100 : 0,
    count: row.count,
  }));

  return {
    categories,
    period,
    totalEmissions: Math.round(totalEmissions * 100) / 100,
  };
}

/**
 * Get emission trend data over time.
 *
 * @param userId - User ID
 * @param period - Time period ('week', 'month', 'year')
 * @returns Array of data points with daily totals and category breakdown
 */
export function getTrend(userId: number, period: string): TrendResponse {
  const db = getDatabase();
  const dateFilter = getDateFilter(period);

  const rows = db
    .prepare(
      `SELECT date, category, SUM(co2_equivalent) as total
       FROM footprint_records
       WHERE user_id = ? AND date >= ${dateFilter}
       GROUP BY date, category
       ORDER BY date ASC`,
    )
    .all(userId) as Array<{ date: string; category: EmissionCategory; total: number }>;

  const dataMap = new Map<string, { total: number; categories: Record<EmissionCategory, number> }>();

  for (const row of rows) {
    if (!dataMap.has(row.date)) {
      dataMap.set(row.date, {
        total: 0,
        categories: { transportation: 0, energy: 0, food: 0, shopping: 0 },
      });
    }
    const entry = dataMap.get(row.date)!;
    entry.total += row.total;
    entry.categories[row.category] += row.total;
  }

  const dataPoints = Array.from(dataMap.entries()).map(([date, data]) => ({
    date,
    total: Math.round(data.total * 100) / 100,
    categories: {
      transportation: Math.round(data.categories.transportation * 100) / 100,
      energy: Math.round(data.categories.energy * 100) / 100,
      food: Math.round(data.categories.food * 100) / 100,
      shopping: Math.round(data.categories.shopping * 100) / 100,
    },
  }));

  const average =
    dataPoints.length > 0
      ? Math.round((dataPoints.reduce((sum, dp) => sum + dp.total, 0) / dataPoints.length) * 100) / 100
      : 0;

  return { dataPoints, period, average };
}

/**
 * Get comparison data between user and average emissions.
 *
 * @param userId - User ID
 * @returns Comparison metrics including percentile ranking
 */
export function getComparison(userId: number): ComparisonResponse {
  const db = getDatabase();

  const monthlyRow = db
    .prepare(
      `SELECT COALESCE(SUM(co2_equivalent), 0) as total
       FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-30 days')`,
    )
    .get(userId) as { total: number };

  const categoryRows = db
    .prepare(
      `SELECT category, SUM(co2_equivalent) as total
       FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-30 days')
       GROUP BY category`,
    )
    .all(userId) as Array<{ category: EmissionCategory; total: number }>;

  const userMonthly = Math.round(monthlyRow.total * 100) / 100;
  const percentile =
    userMonthly <= AVERAGE_MONTHLY_EMISSIONS
      ? Math.round((1 - userMonthly / AVERAGE_MONTHLY_EMISSIONS) * 100)
      : -Math.round((userMonthly / AVERAGE_MONTHLY_EMISSIONS - 1) * 100);

  const categoryComparison = (['transportation', 'energy', 'food', 'shopping'] as EmissionCategory[]).map(
    (category) => {
      const userTotal = categoryRows.find((r) => r.category === category)?.total || 0;
      return {
        category,
        userTotal: Math.round(userTotal * 100) / 100,
        averageTotal: AVERAGE_CATEGORY_EMISSIONS[category],
      };
    },
  );

  return {
    userMonthly,
    averageMonthly: AVERAGE_MONTHLY_EMISSIONS,
    percentile,
    categoryComparison,
  };
}

/**
 * Convert period string to SQLite date filter expression.
 */
function getDateFilter(period: string): string {
  switch (period) {
    case 'week':
      return "date('now', '-7 days')";
    case 'month':
      return "date('now', '-30 days')";
    case 'year':
      return "date('now', '-365 days')";
    default:
      return "date('now', '-30 days')";
  }
}
