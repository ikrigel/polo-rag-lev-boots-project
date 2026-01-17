import { loadAllData as loadAllDataService, clearKnowledgeBase } from '../services/dataLoader.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import logger from '../utils/logger.js';

/**
 * Load all data into the AI knowledge base
 * Orchestrates loading from all sources (PDFs, articles, Slack)
 * Chunks the content, generates embeddings, and stores in the database
 */
export const loadDataToAI = async (): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    logger.section('🚀 Loading Data to AI Knowledge Base');

    // Check if data is already loaded
    logger.info('Checking existing knowledge base entries...');
    const existingCount = await KnowledgeBase.count();
    logger.info(`Found ${existingCount} existing KB entries`);

    if (existingCount > 0) {
      logger.warn(`Database already contains ${existingCount} knowledge entries`);
      logger.info('To reload data, clear the knowledge_base table first');

      return {
        success: true,
        message: `Knowledge base already contains ${existingCount} entries. Use clearKnowledgeBase() to reload.`,
      };
    }

    // Load all data from sources
    logger.info('Starting data loading service...');
    const startTime = Date.now();
    await loadAllDataService();
    const duration = Date.now() - startTime;

    // Verify data was loaded
    logger.info('Verifying loaded data...');
    const finalCount = await KnowledgeBase.count();
    logger.info(`Final KB count: ${finalCount} entries`);

    if (finalCount === 0) {
      logger.error('Data loading completed but no entries were stored');
      return {
        success: false,
        message: 'Data loading completed but no entries were stored.',
        error: 'Unknown error during storage',
      };
    }

    logger.section('✅ Data Loading Complete!');
    logger.info('Load operation summary', {
      totalEntries: finalCount,
      duration: `${duration}ms`,
    });

    return {
      success: true,
      message: `Successfully loaded ${finalCount} knowledge entries into the AI knowledge base.`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in loadDataToAI', error);

    return {
      success: false,
      message: 'Failed to load data to AI knowledge base',
      error: errorMessage,
    };
  }
};

/**
 * Clear all data from the knowledge base
 * Use this to reset and reload data
 */
export const clearAIKnowledgeBase = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await clearKnowledgeBase();
    return {
      success: true,
      message: 'Knowledge base cleared successfully.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error clearing knowledge base:', errorMessage);

    return {
      success: false,
      message: `Failed to clear knowledge base: ${errorMessage}`,
    };
  }
};

/**
 * Get knowledge base statistics
 */
export const getKBStats = async (): Promise<{
  totalEntries: number;
  sourceBreakdown: Record<string, number>;
}> => {
  const total = await KnowledgeBase.count();

  // Get breakdown by source
  const allRecords = await KnowledgeBase.findAll({
    attributes: ['source'],
    raw: true,
  });

  const breakdown: Record<string, number> = {};
  for (const record of allRecords) {
    const source = (record as any).source;
    breakdown[source] = (breakdown[source] || 0) + 1;
  }

  return {
    totalEntries: total,
    sourceBreakdown: breakdown,
  };
};
