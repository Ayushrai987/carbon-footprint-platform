/**
 * @module tests/unit/services/auth.service.test
 * @description Unit tests for authentication service.
 * Tests registration, login, token generation, and error handling.
 */

import * as authService from '../../../services/auth.service';
import { setupTestEnv, createTestDatabase, cleanupTest, mockUser } from '../../fixtures';
import { resetConfig } from '../../../config/environment';

describe('AuthService', () => {
  beforeAll(() => {
    setupTestEnv();
    resetConfig();
  });

  beforeEach(() => {
    createTestDatabase();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      const result = await authService.register(mockUser);

      expect(result.user.email).toBe(mockUser.email.toLowerCase());
      expect(result.user.name).toBe(mockUser.name);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('throws ConflictError for duplicate email', async () => {
      await authService.register(mockUser);

      await expect(authService.register(mockUser)).rejects.toThrow('An account with this email already exists');
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      await authService.register(mockUser);
      const result = await authService.login({
        email: mockUser.email,
        password: mockUser.password,
      });

      expect(result.user.email).toBe(mockUser.email.toLowerCase());
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('throws for invalid password', async () => {
      await authService.register(mockUser);

      await expect(
        authService.login({ email: mockUser.email, password: 'WrongPass1!' }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('throws for non-existent email', async () => {
      await expect(
        authService.login({ email: 'nobody@example.com', password: 'AnyPass1!' }),
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('token verification', () => {
    it('verifies a valid access token', async () => {
      const { tokens } = await authService.register(mockUser);
      const payload = authService.verifyAccessToken(tokens.accessToken);

      expect(payload.userId).toBeDefined();
    });

    it('throws for invalid access token', () => {
      expect(() => authService.verifyAccessToken('invalid-token')).toThrow('Invalid access token');
    });

    it('refreshes tokens with valid refresh token', async () => {
      const { tokens } = await authService.register(mockUser);
      const newTokens = authService.refreshToken(tokens.refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(tokens.accessToken);
    });
  });
});
