/**
 * Utility functions for managing RAGAS Evaluation ground truth Q&A pairs
 * Provides localStorage persistence for ground truth pairs used in RAGAS evaluation
 */

interface GroundTruthPair {
  id: string;
  question: string;
  expectedAnswer: string;
  createdAt: number;
}

interface EvaluationMetrics {
  totalEvaluations: number;
  avgRagasScore: number;
  avgFaithfulness: number;
  avgRelevance: number;
  avgCoherence: number;
  results: any[];
}

interface ScoreTrend {
  date: string;
  avgScore: number;
  count: number;
}

const STORAGE_KEYS = {
  GROUND_TRUTH_PAIRS: 'ragas_ground_truth_pairs',
  EVALUATION_METRICS: 'ragas_evaluation_metrics',
  SCORE_TRENDS: 'ragas_score_trends',
};

/**
 * Save ground truth pairs to localStorage
 * @param pairs - Array of GroundTruthPair objects to save
 */
export const saveGroundTruthPairs = (pairs: GroundTruthPair[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUND_TRUTH_PAIRS, JSON.stringify(pairs));
  } catch (error) {
    console.error('Failed to save ground truth pairs to localStorage:', error);
    throw new Error('Failed to save ground truth pairs');
  }
};

/**
 * Load ground truth pairs from localStorage
 * @returns Array of GroundTruthPair objects, or empty array if none found
 */
export const loadGroundTruthPairs = (): GroundTruthPair[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GROUND_TRUTH_PAIRS);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load ground truth pairs from localStorage:', error);
    return [];
  }
};

/**
 * Save evaluation metrics to localStorage
 * @param metrics - EvaluationMetrics object to save
 */
export const saveEvaluationMetrics = (metrics: EvaluationMetrics): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVALUATION_METRICS, JSON.stringify(metrics));
  } catch (error) {
    console.error('Failed to save evaluation metrics to localStorage:', error);
    throw new Error('Failed to save evaluation metrics');
  }
};

/**
 * Load evaluation metrics from localStorage
 * @returns EvaluationMetrics object or default empty metrics
 */
export const loadEvaluationMetrics = (): EvaluationMetrics => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVALUATION_METRICS);
    if (!stored) {
      return {
        totalEvaluations: 0,
        avgRagasScore: 0,
        avgFaithfulness: 0,
        avgRelevance: 0,
        avgCoherence: 0,
        results: [],
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load evaluation metrics from localStorage:', error);
    return {
      totalEvaluations: 0,
      avgRagasScore: 0,
      avgFaithfulness: 0,
      avgRelevance: 0,
      avgCoherence: 0,
      results: [],
    };
  }
};

/**
 * Save score trends to localStorage
 * @param trends - Array of ScoreTrend objects to save
 */
export const saveScoreTrends = (trends: ScoreTrend[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE_TRENDS, JSON.stringify(trends));
  } catch (error) {
    console.error('Failed to save score trends to localStorage:', error);
    throw new Error('Failed to save score trends');
  }
};

/**
 * Load score trends from localStorage
 * @returns Array of ScoreTrend objects, or empty array if none found
 */
export const loadScoreTrends = (): ScoreTrend[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCORE_TRENDS);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load score trends from localStorage:', error);
    return [];
  }
};

/**
 * Add a new ground truth pair and save to localStorage
 * @param question - The question text
 * @param expectedAnswer - The expected answer text
 * @returns The newly created GroundTruthPair
 */
export const addGroundTruthPair = (
  question: string,
  expectedAnswer: string
): GroundTruthPair => {
  if (!question.trim() || !expectedAnswer.trim()) {
    throw new Error('Question and expected answer cannot be empty');
  }

  const pairs = loadGroundTruthPairs();
  const newPair: GroundTruthPair = {
    id: `pair_${Date.now()}`,
    question,
    expectedAnswer,
    createdAt: Date.now(),
  };

  pairs.push(newPair);
  saveGroundTruthPairs(pairs);
  return newPair;
};

/**
 * Delete a ground truth pair by ID
 * @param pairId - The ID of the pair to delete
 */
export const deleteGroundTruthPair = (pairId: string): void => {
  const pairs = loadGroundTruthPairs();
  const filteredPairs = pairs.filter((p) => p.id !== pairId);
  saveGroundTruthPairs(filteredPairs);
};

/**
 * Clear all ground truth pairs from localStorage
 */
export const clearAllGroundTruthPairs = (): void => {
  saveGroundTruthPairs([]);
};

/**
 * Clear all evaluation data (metrics and trends)
 */
export const clearAllEvaluationData = (): void => {
  saveEvaluationMetrics({
    totalEvaluations: 0,
    avgRagasScore: 0,
    avgFaithfulness: 0,
    avgRelevance: 0,
    avgCoherence: 0,
    results: [],
  });
  saveScoreTrends([]);
};

/**
 * Export all RAGAS evaluation data as JSON
 * @returns Object containing ground truth pairs, metrics, and trends
 */
export const exportAllData = () => {
  return {
    timestamp: new Date().toISOString(),
    groundTruthPairs: loadGroundTruthPairs(),
    evaluationMetrics: loadEvaluationMetrics(),
    scoreTrends: loadScoreTrends(),
  };
};

/**
 * Import RAGAS evaluation data from a JSON object
 * @param data - The data object to import (should match exportAllData format)
 */
export const importAllData = (data: any): void => {
  try {
    if (data.groundTruthPairs && Array.isArray(data.groundTruthPairs)) {
      saveGroundTruthPairs(data.groundTruthPairs);
    }

    if (data.evaluationMetrics && typeof data.evaluationMetrics === 'object') {
      saveEvaluationMetrics(data.evaluationMetrics);
    }

    if (data.scoreTrends && Array.isArray(data.scoreTrends)) {
      saveScoreTrends(data.scoreTrends);
    }
  } catch (error) {
    console.error('Failed to import RAGAS evaluation data:', error);
    throw new Error('Failed to import data');
  }
};

/**
 * Get the total count of stored ground truth pairs
 * @returns Number of ground truth pairs in storage
 */
export const getGroundTruthPairCount = (): number => {
  return loadGroundTruthPairs().length;
};

/**
 * Get storage usage statistics
 * @returns Object containing size information about stored data
 */
export const getStorageStats = () => {
  const pairs = loadGroundTruthPairs();
  const metrics = loadEvaluationMetrics();
  const trends = loadScoreTrends();

  return {
    groundTruthPairsCount: pairs.length,
    evaluationResultsCount: metrics.results.length,
    scoreTrendsCount: trends.length,
    totalStoredData: {
      pairs: JSON.stringify(pairs).length,
      metrics: JSON.stringify(metrics).length,
      trends: JSON.stringify(trends).length,
    },
  };
};
