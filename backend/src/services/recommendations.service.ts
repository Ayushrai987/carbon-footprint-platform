/**
 * @module services/recommendations.service
 * @description AI-driven personalized recommendation engine.
 * Analyzes user footprint data to generate targeted reduction suggestions
 * ranked by potential impact and implementation difficulty.
 */

import { getDatabase } from '../config/database';
import { DEFAULT_RECOMMENDATIONS } from '../config/constants';
import { EmissionCategory, Recommendation } from '../types';

/** Category emission totals for analysis */
interface CategoryTotal {
  category: EmissionCategory;
  total: number;
}

/**
 * Generate personalized carbon reduction recommendations for a user.
 * Analyzes the user's footprint data to identify highest-emitting categories,
 * then returns targeted recommendations sorted by potential impact.
 *
 * @param userId - ID of the user to generate recommendations for
 * @returns Top 5 personalized recommendations sorted by impact
 */
export function generatePersonalizedRecommendations(userId: number): Recommendation[] {
  const db = getDatabase();

  const categoryTotals = db
    .prepare(
      `SELECT category, SUM(co2_equivalent) as total
       FROM footprint_records
       WHERE user_id = ? AND date >= date('now', '-30 days')
       GROUP BY category
       ORDER BY total DESC`,
    )
    .all(userId) as CategoryTotal[];

  if (categoryTotals.length === 0) {
    return getDefaultRecommendations();
  }

  const totalEmissions = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
  const weightedRecs = rankRecommendations(categoryTotals, totalEmissions);

  return weightedRecs.slice(0, 5);
}

/**
 * Get default recommendations when no user data is available.
 * Returns a balanced set across all categories.
 */
function getDefaultRecommendations(): Recommendation[] {
  const categories: EmissionCategory[] = ['transportation', 'energy', 'food', 'shopping'];
  const defaults: Recommendation[] = [];

  for (const category of categories) {
    const catRec = DEFAULT_RECOMMENDATIONS.find((r) => r.category === category);
    if (catRec) {
      defaults.push(catRec);
    }
  }

  return defaults.length > 0 ? defaults : DEFAULT_RECOMMENDATIONS.slice(0, 5);
}

/**
 * Rank recommendations based on user's emission patterns.
 * Gives higher priority to recommendations in the user's highest-emitting categories.
 *
 * @param categoryTotals - User's emissions by category
 * @param totalEmissions - Total user emissions for the period
 * @returns Sorted recommendations array
 */
function rankRecommendations(
  categoryTotals: CategoryTotal[],
  totalEmissions: number,
): Recommendation[] {
  const categoryWeights = new Map<EmissionCategory, number>();

  for (const cat of categoryTotals) {
    const weight = totalEmissions > 0 ? cat.total / totalEmissions : 0.25;
    categoryWeights.set(cat.category, weight);
  }

  const scored = DEFAULT_RECOMMENDATIONS.map((rec) => {
    const categoryWeight = categoryWeights.get(rec.category) || 0.1;
    const impactScore = rec.impact * categoryWeight;
    const difficultyMultiplier =
      rec.difficulty === 'easy' ? 1.3 : rec.difficulty === 'medium' ? 1.0 : 0.7;
    const finalScore = impactScore * difficultyMultiplier;

    return { ...rec, score: finalScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ score: _score, ...rec }) => rec);
}
