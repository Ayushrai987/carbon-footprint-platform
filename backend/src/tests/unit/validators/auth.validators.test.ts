/**
 * @module tests/unit/validators/auth.validators.test
 * @description Unit tests for authentication validation schemas.
 */

import { registerSchema, loginSchema } from '../../../api/validators/auth.validators';

describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass1!',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'ValidPass1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Ab1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'lowercase1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without digit', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'NoDigits!!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without special character', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'NoSpecial1',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass1!',
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects name longer than 50 characters', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass1!',
        name: 'A'.repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'bad-email',
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });
  });
});
