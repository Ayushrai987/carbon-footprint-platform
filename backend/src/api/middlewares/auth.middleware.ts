/**
 * @module api/middlewares/auth.middleware
 * @description JWT authentication middleware.
 * Extracts and verifies Bearer tokens from the Authorization header.
 * Attaches authenticated user data to the request object.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AuthError } from '../../services/auth.service';
import * as userService from '../../services/user.service';
import { AuthenticatedUser } from '../../types';

/** Extend Express Request to include authenticated user */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware — verifies JWT access token.
 * Extracts token from Authorization: Bearer <token> header.
 * Attaches user data to req.user on success.
 *
 * @throws 401 if token is missing, invalid, or expired
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthError('Authorization header is required', 401, 'MISSING_TOKEN');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthError(
        'Invalid authorization format. Use: Bearer <token>',
        401,
        'INVALID_FORMAT',
      );
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);

    const user = userService.findById(payload.userId);
    if (!user) {
      throw new AuthError('User not found', 401, 'USER_NOT_FOUND');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}
