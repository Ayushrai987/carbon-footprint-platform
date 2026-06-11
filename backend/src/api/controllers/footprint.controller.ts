/**
 * @module api/controllers/footprint.controller
 * @description Request handlers for carbon footprint endpoints.
 * Manages activity logging, retrieval, and deletion.
 */

import { Request, Response, NextFunction } from 'express';
import * as footprintService from '../../services/footprint.service';

/**
 * Log a new carbon footprint activity.
 * POST /api/v1/footprint/log
 */
export function logActivity(req: Request, res: Response, next: NextFunction): void {
  try {
    const record = footprintService.logActivity(req.user!.userId, req.body);
    res.status(201).json({
      success: true,
      data: { record },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get today's footprint records.
 * GET /api/v1/footprint/today
 */
export function getToday(req: Request, res: Response, next: NextFunction): void {
  try {
    const records = footprintService.getTodayFootprint(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { records },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get this week's footprint records.
 * GET /api/v1/footprint/week
 */
export function getWeek(req: Request, res: Response, next: NextFunction): void {
  try {
    const records = footprintService.getWeekFootprint(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { records },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get this month's footprint records.
 * GET /api/v1/footprint/month
 */
export function getMonth(req: Request, res: Response, next: NextFunction): void {
  try {
    const records = footprintService.getMonthFootprint(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { records },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get paginated activity history.
 * GET /api/v1/footprint/history
 */
export function getHistory(req: Request, res: Response, next: NextFunction): void {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { records, pagination } = footprintService.getHistory(
      req.user!.userId,
      page,
      limit,
    );
    res.status(200).json({
      success: true,
      data: { records },
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a footprint activity record.
 * DELETE /api/v1/footprint/:id
 */
export function deleteActivity(req: Request, res: Response, next: NextFunction): void {
  try {
    const activityId = Number(req.params.id);
    footprintService.deleteActivity(req.user!.userId, activityId);
    res.status(200).json({
      success: true,
      data: { message: 'Activity deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
}
