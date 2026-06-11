/**
 * @module tests/unit/utils/carbonCalculator.test
 * @description Unit tests for the carbon emissions calculator utility.
 * Tests all category calculators with valid inputs, edge cases, and error handling.
 */

import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
  calculateTotalEmissions,
} from '../../../utils/carbonCalculator';
import { FootprintRecord } from '../../../types';

describe('carbonCalculator', () => {
  describe('calculateTransportEmissions', () => {
    it('calculates petrol car emissions correctly', () => {
      expect(calculateTransportEmissions(100, 'car_petrol')).toBe(21);
    });

    it('calculates electric car emissions correctly', () => {
      expect(calculateTransportEmissions(100, 'car_electric')).toBe(5);
    });

    it('returns 0 for bicycle', () => {
      expect(calculateTransportEmissions(50, 'bicycle')).toBe(0);
    });

    it('returns 0 for zero distance', () => {
      expect(calculateTransportEmissions(0, 'car_petrol')).toBe(0);
    });

    it('throws error for negative distance', () => {
      expect(() => calculateTransportEmissions(-10, 'car_petrol')).toThrow('Distance cannot be negative');
    });

    it('uses fallback for unknown vehicle type', () => {
      const result = calculateTransportEmissions(100, 'unknown_vehicle');
      expect(result).toBe(21); // Falls back to car_petrol factor
    });
  });

  describe('calculateEnergyEmissions', () => {
    it('calculates electricity emissions correctly', () => {
      expect(calculateEnergyEmissions(100, 'electricity')).toBe(40);
    });

    it('calculates natural gas emissions correctly', () => {
      expect(calculateEnergyEmissions(50, 'natural_gas')).toBe(100);
    });

    it('returns 0 for zero usage', () => {
      expect(calculateEnergyEmissions(0, 'electricity')).toBe(0);
    });

    it('throws error for negative usage', () => {
      expect(() => calculateEnergyEmissions(-5, 'electricity')).toThrow('Energy usage cannot be negative');
    });
  });

  describe('calculateFoodEmissions', () => {
    it('calculates beef emissions correctly', () => {
      expect(calculateFoodEmissions('beef', 1)).toBe(27);
    });

    it('calculates plant-based emissions correctly', () => {
      expect(calculateFoodEmissions('plant_based', 2)).toBe(4);
    });

    it('returns 0 for zero quantity', () => {
      expect(calculateFoodEmissions('beef', 0)).toBe(0);
    });

    it('throws error for negative quantity', () => {
      expect(() => calculateFoodEmissions('beef', -1)).toThrow('Quantity cannot be negative');
    });
  });

  describe('calculateShoppingEmissions', () => {
    it('calculates electronics emissions correctly', () => {
      expect(calculateShoppingEmissions('electronics', 1)).toBe(50);
    });

    it('calculates clothing emissions correctly', () => {
      expect(calculateShoppingEmissions('clothing', 3)).toBe(45);
    });

    it('throws error for negative amount', () => {
      expect(() => calculateShoppingEmissions('clothing', -1)).toThrow('Amount cannot be negative');
    });
  });

  describe('calculateTotalEmissions', () => {
    it('calculates total from multiple records', () => {
      const records: FootprintRecord[] = [
        { id: 1, userId: 1, category: 'transportation', activityType: 'car_petrol', value: 50, unit: 'km', co2Equivalent: 10.5, date: '2026-06-10', notes: null, createdAt: '' },
        { id: 2, userId: 1, category: 'food', activityType: 'beef', value: 1, unit: 'kg', co2Equivalent: 27, date: '2026-06-10', notes: null, createdAt: '' },
      ];
      expect(calculateTotalEmissions(records)).toBe(37.5);
    });

    it('returns 0 for empty records array', () => {
      expect(calculateTotalEmissions([])).toBe(0);
    });
  });
});
