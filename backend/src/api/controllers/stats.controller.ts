/**
 * @module api/controllers/stats.controller
 * @description Request handlers for statistics and analytics endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as statsService from '../../services/stats.service';

/**
 * Get emissions summary.
 * GET /api/v1/stats/summary
 */
export function getSummary(req: Request, res: Response, next: NextFunction): void {
  try {
    const summary = statsService.getSummary(req.user!.userId);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get category breakdown.
 * GET /api/v1/stats/breakdown
 */
export function getBreakdown(req: Request, res: Response, next: NextFunction): void {
  try {
    const period = (req.query.period as string) || 'month';
    const breakdown = statsService.getBreakdown(req.user!.userId, period);
    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get emissions trend data.
 * GET /api/v1/stats/trend
 */
export function getTrend(req: Request, res: Response, next: NextFunction): void {
  try {
    const period = (req.query.period as string) || 'month';
    const trend = statsService.getTrend(req.user!.userId, period);
    res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get comparison against averages.
 * GET /api/v1/stats/comparison
 */
export function getComparison(req: Request, res: Response, next: NextFunction): void {
  try {
    const comparison = statsService.getComparison(req.user!.userId);
    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
}
