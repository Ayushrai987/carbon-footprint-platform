/**
 * @module tests/integration/api/stats.api.test
 * @description Integration tests for statistics API endpoints.
 */

import request from 'supertest';
import { createTestApp, cleanupTest, mockUser } from '../../fixtures';
import express from 'express';

describe('Stats API', () => {
  let app: express.Application;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    const res = await request(app).post('/api/v1/auth/register').send(mockUser);
    token = res.body.data.tokens.accessToken;

    // Seed some activity data
    const today = new Date().toISOString().split('T')[0];
    await request(app)
      .post('/api/v1/footprint/log')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'transportation', activityType: 'car_petrol', value: 50, unit: 'km', date: today });
    await request(app)
      .post('/api/v1/footprint/log')
      .set('Authorization', `Bearer ${token}`)
      .send({ category: 'food', activityType: 'beef', value: 1, unit: 'kg', date: today });
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('GET /api/v1/stats/summary', () => {
    it('returns correct emission totals (200)', async () => {
      const res = await request(app)
        .get('/api/v1/stats/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.monthlyEmissions).toBeGreaterThan(0);
      expect(res.body.data.totalActivities).toBe(2);
    });
  });

  describe('GET /api/v1/stats/breakdown', () => {
    it('returns category percentages (200)', async () => {
      const res = await request(app)
        .get('/api/v1/stats/breakdown?period=month')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categories.length).toBeGreaterThan(0);
      const totalPercentage = res.body.data.categories.reduce(
        (sum: number, c: { percentage: number }) => sum + c.percentage,
        0,
      );
      expect(totalPercentage).toBeCloseTo(100, 0);
    });
  });

  describe('GET /api/v1/stats/trend', () => {
    it('returns time series data (200)', async () => {
      const res = await request(app)
        .get('/api/v1/stats/trend?period=month')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.dataPoints).toBeDefined();
      expect(Array.isArray(res.body.data.dataPoints)).toBe(true);
    });
  });

  describe('GET /api/v1/stats/comparison', () => {
    it('returns comparison against average (200)', async () => {
      const res = await request(app)
        .get('/api/v1/stats/comparison')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.userMonthly).toBeDefined();
      expect(res.body.data.averageMonthly).toBeDefined();
      expect(res.body.data.categoryComparison).toHaveLength(4);
    });
  });
});
