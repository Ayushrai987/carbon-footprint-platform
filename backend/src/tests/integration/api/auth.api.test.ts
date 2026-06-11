/**
 * @module tests/integration/api/auth.api.test
 * @description Integration tests for authentication API endpoints.
 * Tests complete request/response cycle through Express.
 */

import request from 'supertest';
import { createTestApp, cleanupTest, mockUser } from '../../fixtures';
import express from 'express';

describe('Auth API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('POST /api/v1/auth/register', () => {
    it('creates user and returns tokens (201)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(mockUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(mockUser.email.toLowerCase());
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('rejects duplicate email (409)', async () => {
      await request(app).post('/api/v1/auth/register').send(mockUser);
      const res = await request(app).post('/api/v1/auth/register').send(mockUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('rejects invalid email format (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...mockUser, email: 'not-valid' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns tokens for valid credentials (200)', async () => {
      await request(app).post('/api/v1/auth/register').send(mockUser);
      const res = await request(app).post('/api/v1/auth/login').send({
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('rejects invalid password (401)', async () => {
      await request(app).post('/api/v1/auth/register').send(mockUser);
      const res = await request(app).post('/api/v1/auth/login').send({
        email: mockUser.email,
        password: 'WrongPass1!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns user profile with valid token (200)', async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send(mockUser);
      const token = registerRes.body.data.tokens.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(mockUser.email.toLowerCase());
    });

    it('rejects invalid token (401)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns new tokens with valid refresh token (200)', async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send(mockUser);
      const refreshToken = registerRes.body.data.tokens.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });
  });
});
