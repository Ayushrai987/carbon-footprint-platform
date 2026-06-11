/**
 * @module api/controllers/recommendations.controller
 * @description Request handler for personalized recommendations endpoint.
 */

import { Request, Response, NextFunction } from 'express';
import * as recommendationsService from '../../services/recommendations.service';

/**
 * Get personalized carbon reduction recommendations.
 * GET /api/v1/recommendations
 */
export function getRecommendations(req: Request, res: Response, next: NextFunction): void {
  try {
    const recommendations = recommendationsService.generatePersonalizedRecommendations(
      req.user!.userId,
    );
    res.status(200).json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    next(error);
  }
}
