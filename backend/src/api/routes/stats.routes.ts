/**
 * @module api/routes/stats.routes
 * @description Statistics and analytics route definitions.
 * All routes require authentication.
 */

import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All stats routes require authentication
router.use(authenticate);

/** GET /stats/summary — Get emissions summary */
router.get('/summary', statsController.getSummary);

/** GET /stats/breakdown — Get category breakdown */
router.get('/breakdown', statsController.getBreakdown);

/** GET /stats/trend — Get emissions trend data */
router.get('/trend', statsController.getTrend);

/** GET /stats/comparison — Get comparison against averages */
router.get('/comparison', statsController.getComparison);

export default router;
