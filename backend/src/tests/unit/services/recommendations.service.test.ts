/**
 * @module tests/unit/services/recommendations.service.test
 * @description Unit tests for the recommendation engine.
 */

import * as recommendationsService from '../../../services/recommendations.service';
import * as footprintService from '../../../services/footprint.service';
import { setupTestEnv, createTestDatabase, cleanupTest, createAuthenticatedUser } from '../../fixtures';
import { resetConfig } from '../../../config/environment';
import Database from 'better-sqlite3';

describe('RecommendationsService', () => {
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

  it('returns default recommendations for user with no data', () => {
    const recs = recommendationsService.generatePersonalizedRecommendations(userId);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(5);
  });

  it('prioritizes transport recommendations for transport-heavy user', () => {
    const today = new Date().toISOString().split('T')[0];
    footprintService.logActivity(userId, {
      category: 'transportation',
      activityType: 'car_petrol',
      value: 500,
      unit: 'km',
      date: today,
    });

    const recs = recommendationsService.generatePersonalizedRecommendations(userId);
    const transportRecs = recs.filter((r) => r.category === 'transportation');
    expect(transportRecs.length).toBeGreaterThan(0);
  });

  it('prioritizes food recommendations for food-heavy user', () => {
    const today = new Date().toISOString().split('T')[0];
    footprintService.logActivity(userId, {
      category: 'food',
      activityType: 'beef',
      value: 10,
      unit: 'kg',
      date: today,
    });

    const recs = recommendationsService.generatePersonalizedRecommendations(userId);
    const foodRecs = recs.filter((r) => r.category === 'food');
    expect(foodRecs.length).toBeGreaterThan(0);
  });

  it('returns at most 5 recommendations', () => {
    const today = new Date().toISOString().split('T')[0];
    footprintService.logActivity(userId, {
      category: 'transportation',
      activityType: 'car_petrol',
      value: 100,
      unit: 'km',
      date: today,
    });
    footprintService.logActivity(userId, {
      category: 'energy',
      activityType: 'electricity',
      value: 200,
      unit: 'kWh',
      date: today,
    });

    const recs = recommendationsService.generatePersonalizedRecommendations(userId);
    expect(recs.length).toBeLessThanOrEqual(5);
  });

  it('each recommendation has required fields', () => {
    const recs = recommendationsService.generatePersonalizedRecommendations(userId);

    for (const rec of recs) {
      expect(rec.action).toBeDefined();
      expect(rec.impact).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(rec.difficulty);
      expect(rec.category).toBeDefined();
    }
  });
});
