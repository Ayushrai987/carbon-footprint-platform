/**
 * @module utils/carbonCalculator
 * @description Pure utility functions for calculating CO2 emissions across
 * all supported categories. Each function takes raw activity data and returns
 * the calculated CO2 equivalent in kilograms, rounded to 2 decimal places.
 */

import { EMISSION_FACTORS } from '../config/constants';
import { FootprintRecord } from '../types';

/**
 * Round a number to the specified decimal places.
 * @param value - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate CO2 emissions from transportation activity.
 *
 * @param distance - Distance traveled in km
 * @param vehicleType - Type of vehicle (e.g., 'car_petrol', 'bus', 'train')
 * @returns CO2 equivalent in kg, rounded to 2 decimal places
 * @throws {Error} If distance is negative
 *
 * @example
 * ```typescript
 * calculateTransportEmissions(50, 'car_petrol'); // 10.5
 * calculateTransportEmissions(100, 'bicycle'); // 0
 * ```
 */
export function calculateTransportEmissions(distance: number, vehicleType: string): number {
  if (distance < 0) {
    throw new Error('Distance cannot be negative');
  }

  if (distance === 0) {
    return 0;
  }

  const factor = EMISSION_FACTORS.transportation[vehicleType];
  if (factor === undefined) {
    // Fallback to average car emissions for unknown types
    const fallback = EMISSION_FACTORS.transportation.car_petrol;
    return roundTo(distance * fallback);
  }

  return roundTo(distance * factor);
}

/**
 * Calculate CO2 emissions from energy usage.
 *
 * @param usage - Energy consumption in kWh
 * @param source - Energy source (e.g., 'electricity', 'natural_gas')
 * @returns CO2 equivalent in kg, rounded to 2 decimal places
 * @throws {Error} If usage is negative
 */
export function calculateEnergyEmissions(usage: number, source: string): number {
  if (usage < 0) {
    throw new Error('Energy usage cannot be negative');
  }

  if (usage === 0) {
    return 0;
  }

  const factor = EMISSION_FACTORS.energy[source];
  if (factor === undefined) {
    const fallback = EMISSION_FACTORS.energy.electricity;
    return roundTo(usage * fallback);
  }

  return roundTo(usage * factor);
}

/**
 * Calculate CO2 emissions from food consumption.
 *
 * @param item - Food item type (e.g., 'beef', 'chicken', 'rice')
 * @param quantity - Quantity consumed in kg
 * @returns CO2 equivalent in kg, rounded to 2 decimal places
 * @throws {Error} If quantity is negative
 */
export function calculateFoodEmissions(item: string, quantity: number): number {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  if (quantity === 0) {
    return 0;
  }

  const factor = EMISSION_FACTORS.food[item];
  if (factor === undefined) {
    // Default to average of vegetables for unknown food
    const fallback = EMISSION_FACTORS.food.vegetables;
    return roundTo(quantity * fallback);
  }

  return roundTo(quantity * factor);
}

/**
 * Calculate CO2 emissions from shopping/purchasing.
 *
 * @param category - Shopping category (e.g., 'clothing', 'electronics')
 * @param amount - Number of items or spending amount
 * @returns CO2 equivalent in kg, rounded to 2 decimal places
 * @throws {Error} If amount is negative
 */
export function calculateShoppingEmissions(category: string, amount: number): number {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }

  if (amount === 0) {
    return 0;
  }

  const factor = EMISSION_FACTORS.shopping[category];
  if (factor === undefined) {
    const fallback = EMISSION_FACTORS.shopping.general;
    return roundTo(amount * fallback);
  }

  return roundTo(amount * factor);
}

/**
 * Calculate total CO2 emissions across multiple footprint records.
 *
 * @param records - Array of footprint records with co2Equivalent values
 * @returns Total CO2 equivalent in kg, rounded to 2 decimal places
 */
export function calculateTotalEmissions(records: FootprintRecord[]): number {
  if (records.length === 0) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + record.co2Equivalent, 0);
  return roundTo(total);
}
