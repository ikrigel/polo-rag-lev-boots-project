import { getLogger } from '../utils/logger';

const logger = getLogger();

interface UserSettings {
  // Feature Flags
  enableConversationalRAG: boolean;
  enableRagAsEvaluation: boolean;
  enableAnalytics: boolean;
  enableConversationHistory: boolean;
  enableAutoSave: boolean;

  // Theme Settings
  theme: 'light' | 'dark' | 'auto';

  // LLM Parameters
  temperature: number;
  maxTokens: number;
  topP: number;

  // RAG Settings
  similarityThreshold: number;
  topKChunks: number;
  contextWindowSize: number;

  // API Settings
  apiTimeout: number;
  retryAttempts: number;

  // Embedding Settings
  embeddingDimension: number;
  embeddingModel: string;

  // Notifications
  enableNotifications: boolean;
  notificationLevel: 'all' | 'warnings' | 'errors';

  // Advanced
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Metadata
  createdAt?: number;
  updatedAt?: number;
  version?: string;
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  enableConversationalRAG: true,
  enableRagAsEvaluation: true,
  enableAnalytics: true,
  enableConversationHistory: true,
  enableAutoSave: true,
  theme: 'auto',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  similarityThreshold: 0.3,
  topKChunks: 5,
  contextWindowSize: 2000,
  apiTimeout: 30,
  retryAttempts: 3,
  embeddingDimension: 768,
  embeddingModel: 'text-embedding-004',
  enableNotifications: true,
  notificationLevel: 'warnings',
  debugMode: false,
  logLevel: 'info',
  version: '1.0.0',
};

// In-memory storage for settings (by user ID or global)
const settingsStore: Map<string, UserSettings> = new Map();

/**
 * Initialize settings with defaults
 */
function initializeSettings(): UserSettings {
  return {
    ...DEFAULT_SETTINGS,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Get settings (global or user-specific)
 */
export function getSettings(userId: string = 'global'): UserSettings {
  let settings = settingsStore.get(userId);

  if (!settings) {
    settings = initializeSettings();
    settingsStore.set(userId, settings);
    logger.info(`Initialized settings for user: ${userId}`);
  }

  return { ...settings };
}

/**
 * Update a single setting
 */
export function updateSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K],
  userId: string = 'global'
): UserSettings {
  let settings = settingsStore.get(userId);

  if (!settings) {
    settings = initializeSettings();
  }

  // Validate the value
  if (!validateSetting(key, value)) {
    logger.error(`Invalid value for setting ${String(key)}: ${value}`);
    return settings;
  }

  settings[key] = value;
  settings.updatedAt = Date.now();

  settingsStore.set(userId, settings);
  logger.info(`Updated setting ${String(key)} for user ${userId}`);

  return { ...settings };
}

/**
 * Update multiple settings
 */
export function updateSettings(
  updates: Partial<UserSettings>,
  userId: string = 'global'
): UserSettings {
  let settings = settingsStore.get(userId);

  if (!settings) {
    settings = initializeSettings();
  }

  // Validate and apply updates
  Object.entries(updates).forEach(([key, value]) => {
    const settingKey = key as keyof UserSettings;
    if (validateSetting(settingKey, value)) {
      settings![settingKey] = value as any;
    }
  });

  settings.updatedAt = Date.now();
  settingsStore.set(userId, settings);
  logger.info(`Updated multiple settings for user ${userId}`);

  return { ...settings };
}

/**
 * Reset settings to defaults
 */
export function resetSettings(userId: string = 'global'): UserSettings {
  const settings = initializeSettings();
  settingsStore.set(userId, settings);
  logger.info(`Reset settings to defaults for user ${userId}`);
  return { ...settings };
}

/**
 * Validate a setting value
 */
function validateSetting<K extends keyof UserSettings>(
  key: K,
  value: any
): boolean {
  switch (key) {
    // Boolean settings
    case 'enableConversationalRAG':
    case 'enableRagAsEvaluation':
    case 'enableAnalytics':
    case 'enableConversationHistory':
    case 'enableAutoSave':
    case 'enableNotifications':
    case 'debugMode':
      return typeof value === 'boolean';

    // String settings
    case 'theme':
      return ['light', 'dark', 'auto'].includes(value);
    case 'notificationLevel':
      return ['all', 'warnings', 'errors'].includes(value);
    case 'logLevel':
      return ['debug', 'info', 'warn', 'error'].includes(value);
    case 'embeddingModel':
      return typeof value === 'string' && value.length > 0;

    // Numeric settings with ranges
    case 'temperature':
      return typeof value === 'number' && value >= 0 && value <= 2;
    case 'maxTokens':
      return typeof value === 'number' && value >= 100 && value <= 8192;
    case 'topP':
      return typeof value === 'number' && value >= 0 && value <= 1;
    case 'similarityThreshold':
      return typeof value === 'number' && value >= 0 && value <= 1;
    case 'topKChunks':
      return typeof value === 'number' && value >= 1 && value <= 20;
    case 'contextWindowSize':
      return typeof value === 'number' && value >= 500 && value <= 5000;
    case 'apiTimeout':
      return typeof value === 'number' && value >= 5 && value <= 120;
    case 'retryAttempts':
      return typeof value === 'number' && value >= 0 && value <= 5;
    case 'embeddingDimension':
      return typeof value === 'number' && [512, 768, 1536, 3072].includes(value);

    default:
      return true;
  }
}

/**
 * Get a specific setting
 */
export function getSetting<K extends keyof UserSettings>(
  key: K,
  userId: string = 'global'
): UserSettings[K] {
  const settings = getSettings(userId);
  return settings[key];
}

/**
 * Get settings as JSON string
 */
export function exportSettings(userId: string = 'global'): string {
  const settings = getSettings(userId);
  return JSON.stringify(settings, null, 2);
}

/**
 * Import settings from JSON
 */
export function importSettings(jsonData: string, userId: string = 'global'): UserSettings | null {
  try {
    const data = JSON.parse(jsonData);

    // Validate all settings
    for (const [key, value] of Object.entries(data)) {
      if (!validateSetting(key as keyof UserSettings, value)) {
        logger.error(`Invalid setting value: ${key} = ${value}`);
        return null;
      }
    }

    const settings: UserSettings = {
      ...getSettings(userId),
      ...data,
      updatedAt: Date.now(),
    };

    settingsStore.set(userId, settings);
    logger.info(`Imported settings for user ${userId}`);

    return { ...settings };
  } catch (error) {
    logger.error(`Failed to import settings: ${error}`);
    return null;
  }
}

/**
 * Get settings summary
 */
export function getSettingsSummary(userId: string = 'global'): object {
  const settings = getSettings(userId);

  return {
    featuresEnabled: {
      conversationalRAG: settings.enableConversationalRAG,
      ragAsEvaluation: settings.enableRagAsEvaluation,
      analytics: settings.enableAnalytics,
      conversationHistory: settings.enableConversationHistory,
      autoSave: settings.enableAutoSave,
      notifications: settings.enableNotifications,
    },
    theme: settings.theme,
    llmParameters: {
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      topP: settings.topP,
    },
    ragConfiguration: {
      similarityThreshold: settings.similarityThreshold,
      topKChunks: settings.topKChunks,
      contextWindowSize: settings.contextWindowSize,
    },
    apiConfiguration: {
      timeout: settings.apiTimeout,
      retryAttempts: settings.retryAttempts,
    },
    embeddings: {
      dimension: settings.embeddingDimension,
      model: settings.embeddingModel,
    },
    logging: {
      debugMode: settings.debugMode,
      logLevel: settings.logLevel,
    },
    metadata: {
      createdAt: settings.createdAt ? new Date(settings.createdAt).toISOString() : null,
      updatedAt: settings.updatedAt ? new Date(settings.updatedAt).toISOString() : null,
      version: settings.version,
    },
  };
}

/**
 * Validate all settings against constraints
 */
export function validateAllSettings(userId: string = 'global'): object {
  const settings = getSettings(userId);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check interdependencies
  if (settings.maxTokens > 4000 && settings.temperature < 0.3) {
    warnings.push('High max tokens with low temperature may produce repetitive output');
  }

  if (settings.similarityThreshold < 0.2) {
    warnings.push('Very low similarity threshold may retrieve irrelevant chunks');
  }

  if (settings.similarityThreshold > 0.8) {
    warnings.push('Very high similarity threshold may miss relevant chunks');
  }

  if (settings.topKChunks > 10 && settings.contextWindowSize < 1500) {
    warnings.push('Many chunks with limited context window may truncate information');
  }

  if (settings.apiTimeout < 10) {
    warnings.push('Very low API timeout may cause frequent failures');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get recommended settings based on use case
 */
export function getRecommendedSettings(useCase: 'creative' | 'balanced' | 'precise'): Partial<UserSettings> {
  const recommendations: Record<string, Partial<UserSettings>> = {
    creative: {
      temperature: 1.2,
      topP: 0.9,
      similarityThreshold: 0.25,
      topKChunks: 8,
    },
    balanced: {
      temperature: 0.7,
      topP: 0.95,
      similarityThreshold: 0.3,
      topKChunks: 5,
    },
    precise: {
      temperature: 0.3,
      topP: 0.8,
      similarityThreshold: 0.5,
      topKChunks: 3,
    },
  };

  return recommendations[useCase] || recommendations.balanced;
}

/**
 * Get all active users' settings (admin function)
 */
export function getAllUsersSettings(): object {
  return {
    totalUsers: settingsStore.size,
    users: Array.from(settingsStore.entries()).map(([userId, settings]) => ({
      userId,
      featuresEnabled: settings.enableConversationalRAG ? 'Yes' : 'No',
      updatedAt: settings.updatedAt ? new Date(settings.updatedAt).toISOString() : null,
    })),
  };
}

/**
 * Delete settings for a user
 */
export function deleteSettings(userId: string): boolean {
  const deleted = settingsStore.delete(userId);
  if (deleted) {
    logger.info(`Deleted settings for user ${userId}`);
  }
  return deleted;
}

/**
 * Clear all settings (reset entire store)
 */
export function clearAllSettings(): void {
  settingsStore.clear();
  logger.info('Cleared all user settings');
}

/**
 * Get settings statistics
 */
export function getSettingsStatistics(): object {
  const allSettings = Array.from(settingsStore.values());

  if (allSettings.length === 0) {
    return { totalUsers: 0 };
  }

  const enabledFeatures = {
    conversationalRAG: allSettings.filter((s) => s.enableConversationalRAG).length,
    ragAsEvaluation: allSettings.filter((s) => s.enableRagAsEvaluation).length,
    analytics: allSettings.filter((s) => s.enableAnalytics).length,
    conversationHistory: allSettings.filter((s) => s.enableConversationHistory).length,
  };

  const avgSettings = {
    temperature: Math.round((allSettings.reduce((s, u) => s + u.temperature, 0) / allSettings.length) * 100) / 100,
    maxTokens: Math.round(allSettings.reduce((s, u) => s + u.maxTokens, 0) / allSettings.length),
    similarityThreshold: Math.round((allSettings.reduce((s, u) => s + u.similarityThreshold, 0) / allSettings.length) * 100) / 100,
  };

  return {
    totalUsers: allSettings.length,
    enabledFeatures,
    averageSettings: avgSettings,
  };
}

// Export default settings and constants
export { DEFAULT_SETTINGS };