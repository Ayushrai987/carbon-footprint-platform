/**
 * @module tests/integration/api/footprint.api.test
 * @description Integration tests for footprint API endpoints.
 */

import request from 'supertest';
import { createTestApp, cleanupTest, mockUser, mockActivity } from '../../fixtures';
import express from 'express';

describe('Footprint API', () => {
  let app: express.Application;
  let token: string;

  beforeEach(async () => {
    app = createTestApp();
    const res = await request(app).post('/api/v1/auth/register').send(mockUser);
    token = res.body.data.tokens.accessToken;
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('POST /api/v1/footprint/log', () => {
    it('logs activity and returns CO2 equivalent (201)', async () => {
      const res = await request(app)
        .post('/api/v1/footprint/log')
        .set('Authorization', `Bearer ${token}`)
        .send(mockActivity);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.record.co2Equivalent).toBeCloseTo(10.5, 1);
      expect(res.body.data.record.category).toBe('transportation');
    });

    it('rejects invalid data (400)', async () => {
      const res = await request(app)
        .post('/api/v1/footprint/log')
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthenticated request (401)', async () => {
      const res = await request(app)
        .post('/api/v1/footprint/log')
        .send(mockActivity);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/footprint/today', () => {
    it('returns today records (200)', async () => {
      const today = new Date().toISOString().split('T')[0];
      await request(app)
        .post('/api/v1/footprint/log')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...mockActivity, date: today });

      const res = await request(app)
        .get('/api/v1/footprint/today')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/footprint/history', () => {
    it('returns paginated results (200)', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/footprint/log')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...mockActivity, date: `2026-06-0${i + 1}` });
      }

      const res = await request(app)
        .get('/api/v1/footprint/history?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.records.length).toBe(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.hasNext).toBe(true);
    });
  });

  describe('DELETE /api/v1/footprint/:id', () => {
    it('deletes an activity (200)', async () => {
      const logRes = await request(app)
        .post('/api/v1/footprint/log')
        .set('Authorization', `Bearer ${token}`)
        .send(mockActivity);

      const activityId = logRes.body.data.record.id;

      const res = await request(app)
        .delete(`/api/v1/footprint/${activityId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Activity deleted successfully');
    });

    it('returns 404 for non-existent activity', async () => {
      const res = await request(app)
        .delete('/api/v1/footprint/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
