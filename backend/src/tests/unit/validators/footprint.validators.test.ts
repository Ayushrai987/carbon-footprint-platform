/**
 * @module tests/unit/validators/footprint.validators.test
 * @description Unit tests for footprint validation schemas.
 */

import { logActivitySchema } from '../../../api/validators/footprint.validators';

describe('Footprint Validators', () => {
  describe('logActivitySchema', () => {
    it('accepts valid activity data', () => {
      const result = logActivitySchema.safeParse({
        category: 'transportation',
        activityType: 'car_petrol',
        value: 50,
        unit: 'km',
        date: '2026-06-10',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid category', () => {
      const result = logActivitySchema.safeParse({
        category: 'flying',
        activityType: 'jet',
        value: 50,
        unit: 'km',
        date: '2026-06-10',
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative value', () => {
      const result = logActivitySchema.safeParse({
        category: 'transportation',
        activityType: 'car_petrol',
        value: -10,
        unit: 'km',
        date: '2026-06-10',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const result = logActivitySchema.safeParse({
        category: 'transportation',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const result = logActivitySchema.safeParse({
        category: 'transportation',
        activityType: 'car_petrol',
        value: 50,
        unit: 'km',
        date: '06/10/2026',
      });
      expect(result.success).toBe(false);
    });

    it('accepts optional notes field', () => {
      const result = logActivitySchema.safeParse({
        category: 'food',
        activityType: 'beef',
        value: 1,
        unit: 'kg',
        date: '2026-06-10',
        notes: 'Dinner',
      });
      expect(result.success).toBe(true);
    });
  });
});
