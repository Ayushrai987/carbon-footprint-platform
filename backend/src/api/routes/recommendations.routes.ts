/**
 * @module api/routes/recommendations.routes
 * @description Recommendations route definitions.
 * All routes require authentication.
 */

import { Router } from 'express';
import * as recommendationsController from '../controllers/recommendations.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/** GET /recommendations — Get personalized carbon reduction recommendations */
router.get('/', authenticate, recommendationsController.getRecommendations);

export default router;
