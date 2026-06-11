/**
 * @module api/routes/auth.routes
 * @description Authentication route definitions.
 * Wires up auth endpoints with validation middleware and controllers.
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validators';

const router = Router();

/** POST /auth/register — Create a new user account */
router.post('/register', validateBody(registerSchema), authController.register);

/** POST /auth/login — Authenticate with email and password */
router.post('/login', validateBody(loginSchema), authController.login);

/** POST /auth/refresh — Refresh access token */
router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);

/** POST /auth/logout — Invalidate session (requires auth) */
router.post('/logout', authenticate, authController.logout);

/** GET /auth/me — Get current user profile (requires auth) */
router.get('/me', authenticate, authController.me);

export default router;
