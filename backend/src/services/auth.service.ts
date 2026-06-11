/**
 * @module services/auth.service
 * @description Authentication service handling registration, login, and JWT token management.
 * Implements secure password hashing with bcryptjs and JWT token generation/verification.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getConfig } from '../config/environment';
import { AuthTokens, LoginRequest, RegisterRequest, TokenPayload, UserPublic } from '../types';
import * as userService from './user.service';
import { logger } from '../utils/logger';

/** Custom error for authentication failures */
export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Generate JWT access and refresh token pair for a user.
 * @param userId - The user's database ID
 * @returns Object containing accessToken and refreshToken
 */
export function generateTokens(userId: number): AuthTokens {
  const config = getConfig();
  const payload: TokenPayload = { 
    userId,
    jti: crypto.randomUUID()
  };

  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

/**
 * Verify and decode a JWT access token.
 * @param token - The JWT access token to verify
 * @returns Decoded token payload with userId
 * @throws {AuthError} If token is invalid or expired
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const config = getConfig();
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Access token has expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AuthError('Invalid access token', 401, 'INVALID_TOKEN');
  }
}

/**
 * Verify and decode a JWT refresh token.
 * @param token - The JWT refresh token to verify
 * @returns Decoded token payload with userId
 * @throws {AuthError} If token is invalid or expired
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const config = getConfig();
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Refresh token has expired', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    throw new AuthError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * Register a new user account.
 * @param data - Registration data (email, password, name)
 * @returns Object containing user profile and auth tokens
 * @throws {AuthError} If email already exists (409 Conflict)
 */
export async function register(
  data: RegisterRequest,
): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  const existing = userService.findByEmail(data.email);
  if (existing) {
    throw new AuthError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  const config = getConfig();
  const passwordHash = await bcrypt.hash(data.password, config.BCRYPT_ROUNDS);
  const user = userService.createUser(data, passwordHash);
  const tokens = generateTokens(user.id);

  logger.info(`New user registered: ${user.email}`);
  return { user, tokens };
}

/**
 * Authenticate an existing user.
 * @param data - Login credentials (email, password)
 * @returns Object containing user profile and auth tokens
 * @throws {AuthError} If credentials are invalid (401 Unauthorized)
 */
export async function login(
  data: LoginRequest,
): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  const user = userService.findByEmail(data.email);
  if (!user) {
    throw new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user.id);
  const userPublic: UserPublic = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  logger.info(`User logged in: ${user.email}`);
  return { user: userPublic, tokens };
}

/**
 * Refresh authentication tokens using a valid refresh token.
 * @param refreshTokenStr - The current refresh token
 * @returns New access and refresh token pair
 * @throws {AuthError} If refresh token is invalid
 */
export function refreshToken(refreshTokenStr: string): AuthTokens {
  const payload = verifyRefreshToken(refreshTokenStr);
  const user = userService.findById(payload.userId);

  if (!user) {
    throw new AuthError('User not found', 401, 'USER_NOT_FOUND');
  }

  return generateTokens(user.id);
}
