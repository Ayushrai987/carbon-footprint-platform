/**
 * @module tests/unit/services/footprint.service.test
 * @description Unit tests for footprint service.
 */

import * as footprintService from '../../../services/footprint.service';
import { setupTestEnv, createTestDatabase, cleanupTest, createAuthenticatedUser } from '../../fixtures';
import { resetConfig } from '../../../config/environment';
import Database from 'better-sqlite3';

describe('FootprintService', () => {
  let db: Database.Database;
  let userId: number;

  beforeAll(() => {
    setupTestEnv();
    resetConfig();
  });

  beforeEach(() => {
    db = createTestDatabase();
    const auth = createAuthenticatedUser(db);
    userId = auth.userId;
  });

  afterEach(() => {
    cleanupTest();
  });

  it('logs a new activity and calculates CO2', () => {
    const record = footprintService.logActivity(userId, {
      category: 'transportation',
      activityType: 'car_petrol',
      value: 50,
      unit: 'km',
      date: '2026-06-10',
    });

    expect(record.co2Equivalent).toBe(10.5);
    expect(record.userId).toBe(userId);
    expect(record.category).toBe('transportation');
  });

  it('retrieves today footprint', () => {
    const today = new Date().toISOString().split('T')[0];
    footprintService.logActivity(userId, {
      category: 'food',
      activityType: 'beef',
      value: 1,
      unit: 'kg',
      date: today,
    });

    const records = footprintService.getTodayFootprint(userId);
    expect(records.length).toBe(1);
    expect(records[0].co2Equivalent).toBe(27);
  });

  it('retrieves weekly footprint', () => {
    const today = new Date().toISOString().split('T')[0];
    footprintService.logActivity(userId, {
      category: 'energy',
      activityType: 'electricity',
      value: 100,
      unit: 'kWh',
      date: today,
    });

    const records = footprintService.getWeekFootprint(userId);
    expect(records.length).toBeGreaterThanOrEqual(1);
  });

  it('paginates history correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < 5; i++) {
      footprintService.logActivity(userId, {
        category: 'transportation',
        activityType: 'bus',
        value: 10 + i,
        unit: 'km',
        date: today,
      });
    }

    const { records, pagination } = footprintService.getHistory(userId, 1, 2);
    expect(records.length).toBe(2);
    expect(pagination.total).toBe(5);
    expect(pagination.totalPages).toBe(3);
    expect(pagination.hasNext).toBe(true);
  });

  it('deletes an activity', () => {
    const today = new Date().toISOString().split('T')[0];
    const record = footprintService.logActivity(userId, {
      category: 'shopping',
      activityType: 'clothing',
      value: 1,
      unit: 'items',
      date: today,
    });

    footprintService.deleteActivity(userId, record.id);
    const { records } = footprintService.getHistory(userId, 1, 10);
    expect(records.length).toBe(0);
  });

  it('throws when deleting non-existent activity', () => {
    expect(() => footprintService.deleteActivity(userId, 99999)).toThrow('Activity not found');
  });
});
