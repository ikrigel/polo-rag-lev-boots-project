import { Request, Response } from 'express';
import { getLogger } from '../utils/logger';
import * as RagAs from '../BusinessLogic/RagAs.js';

const logger = getLogger();

/**
 * POST /api/ragas/ground-truth/add
 * Add a ground truth Q&A pair
 */
export const addGroundTruthPair = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, expectedAnswer } = req.body || {};

    if (!question || !expectedAnswer) {
      res.status(400).json({
        ok: false,
        error: 'question and expectedAnswer are required',
      });
      return;
    }

    const pair = RagAs.addGroundTruthPair(question, expectedAnswer);

    logger.info(`Added ground truth pair: ${pair.id}`);
    res.status(201).json({
      ok: true,
      pair,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error adding ground truth pair: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to add ground truth pair',
    });
  }
};

/**
 * GET /api/ragas/ground-truth/:pairId
 * Get a specific ground truth pair
 */
export const getGroundTruthPair = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pairId } = req.params;
    const pair = RagAs.getGroundTruthPair(pairId);

    if (!pair) {
      res.status(404).json({
        ok: false,
        error: 'Ground truth pair not found',
      });
      return;
    }

    logger.debug(`Retrieved ground truth pair: ${pairId}`);
    res.status(200).json({
      ok: true,
      pair,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting ground truth pair: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get ground truth pair',
    });
  }
};

/**
 * GET /api/ragas/ground-truth/list
 * List all ground truth pairs
 */
export const listGroundTruthPairs = async (_: Request, res: Response): Promise<void> => {
  try {
    const pairs = RagAs.listGroundTruthPairs();

    logger.debug(`Listed ${pairs.length} ground truth pairs`);
    res.status(200).json({
      ok: true,
      count: pairs.length,
      pairs,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error listing ground truth pairs: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to list ground truth pairs',
    });
  }
};

/**
 * DELETE /api/ragas/ground-truth/:pairId
 * Delete a ground truth pair
 */
export const deleteGroundTruthPair = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pairId } = req.params;
    const deleted = RagAs.deleteGroundTruthPair(pairId);

    if (!deleted) {
      res.status(404).json({
        ok: false,
        error: 'Ground truth pair not found',
      });
      return;
    }

    logger.info(`Deleted ground truth pair: ${pairId}`);
    res.status(200).json({
      ok: true,
      message: 'Ground truth pair deleted successfully',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error deleting ground truth pair: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to delete ground truth pair',
    });
  }
};

/**
 * POST /api/ragas/evaluate
 * Evaluate an answer against a ground truth pair
 */
export const evaluateAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pairId, actualAnswer } = req.body || {};

    if (!pairId || !actualAnswer) {
      res.status(400).json({
        ok: false,
        error: 'pairId and actualAnswer are required',
      });
      return;
    }

    const result = RagAs.evaluateAnswer(pairId, actualAnswer);

    if (!result) {
      res.status(404).json({
        ok: false,
        error: 'Ground truth pair not found',
      });
      return;
    }

    logger.info(`Evaluated answer for pair ${pairId}. RAGAS: ${result.ragas_score}`);
    res.status(200).json({
      ok: true,
      result,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error evaluating answer: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to evaluate answer',
    });
  }
};

/**
 * GET /api/ragas/results/:pairId
 * Get evaluation results for a pair
 */
export const getEvaluationResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pairId } = req.params;
    const results = RagAs.getEvaluationResults(pairId);

    logger.debug(`Retrieved ${results.length} evaluation results for pair ${pairId}`);
    res.status(200).json({
      ok: true,
      count: results.length,
      results,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting evaluation results: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get evaluation results',
    });
  }
};

/**
 * GET /api/ragas/metrics
 * Get aggregate evaluation metrics
 */
export const getMetrics = async (_: Request, res: Response): Promise<void> => {
  try {
    const metrics = RagAs.getMetrics();

    logger.debug(`Retrieved aggregate metrics`);
    res.status(200).json({
      ok: true,
      metrics,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting metrics: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get metrics',
    });
  }
};

/**
 * GET /api/ragas/trends
 * Get score trends over time
 */
export const getTrends = async (_: Request, res: Response): Promise<void> => {
  try {
    const trends = RagAs.calculateTrends();

    logger.debug(`Retrieved ${trends.length} trend points`);
    res.status(200).json({
      ok: true,
      count: trends.length,
      trends,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting trends: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get trends',
    });
  }
};

/**
 * GET /api/ragas/distribution
 * Get score distribution statistics
 */
export const getDistribution = async (_: Request, res: Response): Promise<void> => {
  try {
    const distribution = RagAs.getScoreDistribution();

    logger.debug(`Retrieved score distribution`);
    res.status(200).json({
      ok: true,
      distribution,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting distribution: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get distribution',
    });
  }
};

/**
 * GET /api/ragas/report
 * Get comprehensive quality report
 */
export const getQualityReport = async (_: Request, res: Response): Promise<void> => {
  try {
    const report = RagAs.getQualityReport();

    logger.info(`Generated quality report`);
    res.status(200).json({
      ok: true,
      report,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting quality report: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get quality report',
    });
  }
};

/**
 * POST /api/ragas/batch-evaluate
 * Batch evaluate multiple answers
 */
export const batchEvaluate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { evaluations } = req.body || {};

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      res.status(400).json({
        ok: false,
        error: 'evaluations array is required',
      });
      return;
    }

    const results = await RagAs.batchEvaluate(evaluations);

    logger.info(`Batch evaluated ${results.length} answers`);
    res.status(200).json({
      ok: true,
      count: results.length,
      results,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error in batch evaluation: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to batch evaluate',
    });
  }
};

/**
 * GET /api/ragas/export
 * Export all RAGAS data as JSON
 */
export const exportData = async (_: Request, res: Response): Promise<void> => {
  try {
    const data = RagAs.exportData();

    logger.info(`Exported RAGAS data`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ragas_data_${Date.now()}.json"`);
    res.status(200).send(data);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error exporting data: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to export data',
    });
  }
};