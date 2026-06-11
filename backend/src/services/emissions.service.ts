/**
 * @module services/emissions.service
 * @description Central emissions calculation dispatcher.
 * Routes calculation requests to the appropriate category-specific calculator.
 */

import { EmissionCategory } from '../types';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
} from '../utils/carbonCalculator';

/**
 * Calculate CO2 emissions for a given activity.
 * Dispatches to the appropriate category calculator.
 *
 * @param category - The emission category
 * @param activityType - Specific activity within the category
 * @param value - Numeric value (distance, usage, quantity, or amount)
 * @param _unit - Unit of measurement (used for validation context)
 * @returns CO2 equivalent in kg
 * @throws {Error} If category is unknown or value is invalid
 */
export function calculateEmissions(
  category: EmissionCategory,
  activityType: string,
  value: number,
  _unit: string,
): number {
  if (value < 0) {
    throw new Error('Value cannot be negative');
  }

  switch (category) {
    case 'transportation':
      return calculateTransportEmissions(value, activityType);
    case 'energy':
      return calculateEnergyEmissions(value, activityType);
    case 'food':
      return calculateFoodEmissions(activityType, value);
    case 'shopping':
      return calculateShoppingEmissions(activityType, value);
    default: {
      const exhaustive: never = category;
      throw new Error(`Unknown emission category: ${String(exhaustive)}`);
    }
  }
}
