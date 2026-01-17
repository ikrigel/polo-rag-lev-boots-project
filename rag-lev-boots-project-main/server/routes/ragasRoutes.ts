import express from 'express';
import * as controller from '../controllers/ragasController';

const router = express.Router();

/**
 * Ground Truth Pair Management
 */
router.post('/ground-truth/add', controller.addGroundTruthPair);
router.get('/ground-truth/:pairId', controller.getGroundTruthPair);
router.get('/ground-truth/list', controller.listGroundTruthPairs);
router.delete('/ground-truth/:pairId', controller.deleteGroundTruthPair);

/**
 * Evaluation Endpoints
 */
router.post('/evaluate', controller.evaluateAnswer);
router.post('/batch-evaluate', controller.batchEvaluate);
router.get('/results/:pairId', controller.getEvaluationResults);

/**
 * Analytics and Metrics
 */
router.get('/metrics', controller.getMetrics);
router.get('/trends', controller.getTrends);
router.get('/distribution', controller.getDistribution);
router.get('/report', controller.getQualityReport);

/**
 * Data Export
 */
router.get('/export', controller.exportData);

export default router;