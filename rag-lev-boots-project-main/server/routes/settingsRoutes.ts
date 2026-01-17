import express from 'express';
import * as controller from '../controllers/settingsController';

const router = express.Router();

/**
 * Core Settings Operations
 */
router.get('/', controller.getSettings);
router.put('/', controller.updateSettings);
router.patch('/:key', controller.updateSetting);
router.get('/:key', controller.getSetting);

/**
 * Settings Management
 */
router.post('/reset', controller.resetSettings);
router.post('/validate', controller.validateSettings);
router.get('/summary', controller.getSettingsSummary);

/**
 * Import/Export
 */
router.post('/export', controller.exportSettings);
router.post('/import', controller.importSettings);

/**
 * Recommendations
 */
router.post('/recommended', controller.getRecommendedSettings);

/**
 * Admin Endpoints
 */
router.get('/admin/all', controller.getAllUsersSettings);
router.get('/admin/stats', controller.getSettingsStatistics);
router.delete('/user/:userId', controller.deleteUserSettings);

export default router;