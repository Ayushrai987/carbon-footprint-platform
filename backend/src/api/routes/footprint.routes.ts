/**
 * @module api/routes/footprint.routes
 * @description Footprint activity route definitions.
 * All routes require authentication.
 */

import { Router } from 'express';
import * as footprintController from '../controllers/footprint.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../middlewares/validation.middleware';
import {
  logActivitySchema,
  historyQuerySchema,
  activityIdSchema,
} from '../validators/footprint.validators';

const router = Router();

// All footprint routes require authentication
router.use(authenticate);

/** POST /footprint/log — Log a new carbon footprint activity */
router.post('/log', validateBody(logActivitySchema), footprintController.logActivity);

/** GET /footprint/today — Get today's records */
router.get('/today', footprintController.getToday);

/** GET /footprint/week — Get this week's records */
router.get('/week', footprintController.getWeek);

/** GET /footprint/month — Get this month's records */
router.get('/month', footprintController.getMonth);

/** GET /footprint/history — Get paginated activity history */
router.get('/history', validateQuery(historyQuerySchema), footprintController.getHistory);

/** DELETE /footprint/:id — Delete an activity record */
router.delete('/:id', validateParams(activityIdSchema), footprintController.deleteActivity);

export default router;
