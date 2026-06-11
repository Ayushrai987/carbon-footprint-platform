/**
 * @module api/controllers/auth.controller
 * @description Request handlers for authentication endpoints.
 * Delegates business logic to auth.service and returns structured responses.
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/auth.service';
import * as userService from '../../services/user.service';

/**
 * Handle user registration.
 * POST /api/v1/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: { user, tokens },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user login.
 * POST /api/v1/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, tokens } = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: { user, tokens },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle token refresh.
 * POST /api/v1/auth/refresh
 */
export function refresh(req: Request, res: Response, next: NextFunction): void {
  try {
    const { refreshToken } = req.body;
    const tokens = authService.refreshToken(refreshToken);
    res.status(200).json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user logout.
 * POST /api/v1/auth/logout
 */
export function logout(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}

/**
 * Get current user profile.
 * GET /api/v1/auth/me
 */
export function me(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = userService.findById(req.user!.userId);
    if (!user) {
      throw new authService.AuthError('User not found', 404, 'USER_NOT_FOUND');
    }
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
