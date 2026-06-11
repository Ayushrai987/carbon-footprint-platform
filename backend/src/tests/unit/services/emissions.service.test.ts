/**
 * @module tests/unit/services/emissions.service.test
 * @description Unit tests for the emissions calculation dispatcher service.
 */

import { calculateEmissions } from '../../../services/emissions.service';

describe('EmissionsService', () => {
  it('calculates transportation emissions', () => {
    const result = calculateEmissions('transportation', 'car_petrol', 100, 'km');
    expect(result).toBe(21);
  });

  it('calculates energy emissions', () => {
    const result = calculateEmissions('energy', 'electricity', 50, 'kWh');
    expect(result).toBe(20);
  });

  it('calculates food emissions', () => {
    const result = calculateEmissions('food', 'chicken', 2, 'kg');
    expect(result).toBe(13.8);
  });

  it('calculates shopping emissions', () => {
    const result = calculateEmissions('shopping', 'electronics', 1, 'items');
    expect(result).toBe(50);
  });

  it('throws error for negative value', () => {
    expect(() => calculateEmissions('transportation', 'car_petrol', -10, 'km')).toThrow(
      'Value cannot be negative',
    );
  });

  it('handles unknown activity type with fallback', () => {
    const result = calculateEmissions('transportation', 'hovercraft', 100, 'km');
    expect(result).toBe(21); // Falls back to car_petrol
  });

  it('returns 0 for zero value', () => {
    const result = calculateEmissions('transportation', 'car_petrol', 0, 'km');
    expect(result).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    const result = calculateEmissions('transportation', 'bus', 33, 'km');
    expect(result).toBe(2.94);
  });
});
