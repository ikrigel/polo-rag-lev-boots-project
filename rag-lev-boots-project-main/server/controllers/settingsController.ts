import { Request, Response } from 'express';
import { getLogger } from '../utils/logger';
import * as Settings from '../BusinessLogic/Settings.js';

const logger = getLogger();

/**
 * GET /api/settings
 * Get current settings for user
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || 'global';
    const settings = Settings.getSettings(userId);

    logger.debug(`Retrieved settings for user ${userId}`);
    res.status(200).json({
      ok: true,
      settings,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get settings',
    });
  }
};

/**
 * PUT /api/settings
 * Update multiple settings for user
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || 'global';
    const updates = req.body || {};

    const updated = Settings.updateSettings(updates, userId);

    logger.info(`Updated settings for user ${userId}`);
    res.status(200).json({
      ok: true,
      settings: updated,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error updating settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to update settings',
    });
  }
};

/**
 * PATCH /api/settings/:key
 * Update a single setting
 */
export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body || {};
    const userId = req.query.userId as string || 'global';

    if (value === undefined) {
      res.status(400).json({
        ok: false,
        error: 'value is required',
      });
      return;
    }

    const updated = Settings.updateSetting(key as any, value, userId);

    logger.info(`Updated setting ${key} for user ${userId}`);
    res.status(200).json({
      ok: true,
      settings: updated,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error updating setting: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to update setting',
    });
  }
};

/**
 * GET /api/settings/:key
 * Get a specific setting
 */
export const getSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const userId = req.query.userId as string || 'global';

    const value = Settings.getSetting(key as any, userId);

    logger.debug(`Retrieved setting ${key} for user ${userId}`);
    res.status(200).json({
      ok: true,
      key,
      value,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting setting: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get setting',
    });
  }
};

/**
 * POST /api/settings/reset
 * Reset settings to defaults
 */
export const resetSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || 'global';
    const reset = Settings.resetSettings(userId);

    logger.info(`Reset settings to defaults for user ${userId}`);
    res.status(200).json({
      ok: true,
      message: 'Settings reset to defaults',
      settings: reset,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error resetting settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to reset settings',
    });
  }
};

/**
 * POST /api/settings/validate
 * Validate all settings
 */
export const validateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || 'global';
    const validation = Settings.validateAllSettings(userId);

    logger.debug(`Validated settings for user ${userId}`);
    res.status(200).json({
      ok: true,
      validation,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error validating settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to validate settings',
    });
  }
};

/**
 * GET /api/settings/summary
 * Get settings summary
 */
export const getSettingsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || 'global';
    const summary = Settings.getSettingsSummary(userId);

    logger.debug(`Retrieved settings summary for user ${userId}`);
    res.status(200).json({
      ok: true,
      summary,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting settings summary: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get settings summary',
    });
  }
};

/**
 * POST /api/settings/recommended
 * Get recommended settings for use case
 */
export const getRecommendedSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { useCase } = req.body || {};

    if (!['creative', 'balanced', 'precise'].includes(useCase)) {
      res.status(400).json({
        ok: false,
        error: 'useCase must be one of: creative, balanced, precise',
      });
      return;
    }

    const recommended = Settings.getRecommendedSettings(useCase as any);

    logger.debug(`Retrieved recommended settings for use case: ${useCase}`);
    res.status(200).json({
      ok: true,
      useCase,
      recommended,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting recommended settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get recommended settings',
    });
  }
};

/**
 * POST /api/settings/export
 * Export settings as JSON
 */
export const exportSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string || 'global';
    const data = Settings.exportSettings(userId);

    logger.info(`Exported settings for user ${userId}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="settings_${userId}_${Date.now()}.json"`);
    res.status(200).send(data);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error exporting settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to export settings',
    });
  }
};

/**
 * POST /api/settings/import
 * Import settings from JSON
 */
export const importSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jsonData } = req.body || {};
    const userId = req.query.userId as string || 'global';

    if (!jsonData) {
      res.status(400).json({
        ok: false,
        error: 'jsonData is required',
      });
      return;
    }

    const imported = Settings.importSettings(jsonData, userId);

    if (!imported) {
      res.status(400).json({
        ok: false,
        error: 'Failed to import settings - invalid format',
      });
      return;
    }

    logger.info(`Imported settings for user ${userId}`);
    res.status(200).json({
      ok: true,
      message: 'Settings imported successfully',
      settings: imported,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error importing settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to import settings',
    });
  }
};

/**
 * GET /api/settings/admin/all
 * Get all users' settings (admin only)
 */
export const getAllUsersSettings = async (_: Request, res: Response): Promise<void> => {
  try {
    const allSettings = Settings.getAllUsersSettings();

    logger.info(`Retrieved all users' settings`);
    res.status(200).json({
      ok: true,
      data: allSettings,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting all users' settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get all users settings',
    });
  }
};

/**
 * GET /api/settings/admin/stats
 * Get settings statistics (admin only)
 */
export const getSettingsStatistics = async (_: Request, res: Response): Promise<void> => {
  try {
    const stats = Settings.getSettingsStatistics();

    logger.debug(`Retrieved settings statistics`);
    res.status(200).json({
      ok: true,
      stats,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error getting settings statistics: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to get settings statistics',
    });
  }
};

/**
 * DELETE /api/settings/user/:userId
 * Delete settings for a user (admin only)
 */
export const deleteUserSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const deleted = Settings.deleteSettings(userId);

    if (!deleted) {
      res.status(404).json({
        ok: false,
        error: 'User settings not found',
      });
      return;
    }

    logger.info(`Deleted settings for user ${userId}`);
    res.status(200).json({
      ok: true,
      message: 'User settings deleted successfully',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Error deleting user settings: ${errorMsg}`, error);
    res.status(500).json({
      ok: false,
      error: errorMsg || 'Failed to delete user settings',
    });
  }
};