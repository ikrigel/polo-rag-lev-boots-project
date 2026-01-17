import { getLogger } from '../utils/logger';

const logger = getLogger();

interface GroundTruthPair {
  id: string;
  question: string;
  expectedAnswer: string;
  createdAt: number;
}

interface EvaluationResult {
  pairId: string;
  actualAnswer: string;
  ragas_score: number;
  faithfulness: number;
  relevance: number;
  coherence: number;
  timestamp: number;
}

interface EvaluationMetrics {
  totalEvaluations: number;
  avgRagasScore: number;
  avgFaithfulness: number;
  avgRelevance: number;
  avgCoherence: number;
  results: EvaluationResult[];
}

interface ScoreTrend {
  date: string;
  avgScore: number;
  count: number;
}

// In-memory storage
const groundTruthPairs: Map<string, GroundTruthPair> = new Map();
const evaluationResults: Map<string, EvaluationResult[]> = new Map();
let cumulativeMetrics: EvaluationMetrics = {
  totalEvaluations: 0,
  avgRagasScore: 0,
  avgFaithfulness: 0,
  avgRelevance: 0,
  avgCoherence: 0,
  results: [],
};

/**
 * Generate a unique pair ID
 */
function generatePairId(): string {
  return `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a ground truth Q&A pair
 */
export function addGroundTruthPair(
  question: string,
  expectedAnswer: string
): GroundTruthPair {
  const id = generatePairId();
  const pair: GroundTruthPair = {
    id,
    question,
    expectedAnswer,
    createdAt: Date.now(),
  };

  groundTruthPairs.set(id, pair);
  logger.info(`Added ground truth pair: ${id}`);

  return pair;
}

/**
 * Get a ground truth pair
 */
export function getGroundTruthPair(id: string): GroundTruthPair | undefined {
  return groundTruthPairs.get(id);
}

/**
 * List all ground truth pairs
 */
export function listGroundTruthPairs(): GroundTruthPair[] {
  return Array.from(groundTruthPairs.values());
}

/**
 * Delete a ground truth pair
 */
export function deleteGroundTruthPair(id: string): boolean {
  const deleted = groundTruthPairs.delete(id);
  if (deleted) {
    logger.info(`Deleted ground truth pair: ${id}`);
    // Also delete associated evaluation results
    evaluationResults.delete(id);
  }
  return deleted;
}

/**
 * Calculate faithfulness score (how much of actual answer is supported by expected)
 * Range: 0-100
 */
function calculateFaithfulness(actualAnswer: string, expectedAnswer: string): number {
  const actualWords = actualAnswer.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const expectedWords = expectedAnswer.toLowerCase().split(/\s+/).filter((w) => w.length > 0);

  if (actualWords.length === 0 || expectedWords.length === 0) return 0;

  const supportedWords = actualWords.filter((w) => expectedWords.includes(w)).length;
  const faithfulness = (supportedWords / actualWords.length) * 100;

  return Math.round(faithfulness * 100) / 100;
}

/**
 * Calculate relevance score (how much of expected answer is in actual)
 * Range: 0-100
 */
function calculateRelevance(actualAnswer: string, expectedAnswer: string): number {
  const actualWords = actualAnswer.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const expectedWords = expectedAnswer.toLowerCase().split(/\s+/).filter((w) => w.length > 0);

  if (expectedWords.length === 0) return 0;

  const coveredWords = expectedWords.filter((w) => actualWords.includes(w)).length;
  const relevance = (coveredWords / expectedWords.length) * 100;

  return Math.round(relevance * 100) / 100;
}

/**
 * Calculate coherence score (based on sentence structure and length)
 * Range: 0-100
 */
function calculateCoherence(answer: string): number {
  const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength =
    sentences.length > 0
      ? answer.split(/\s+/).length / sentences.length
      : 0;

  // Ideal sentence length is 10-20 words
  const idealLength = 15;
  const lengthRatio = Math.min(avgSentenceLength / idealLength, 1);

  // Coherence based on:
  // - Sentence count (more sentences = better structure)
  // - Average sentence length
  const sentenceScore = Math.min((sentences.length / 5) * 100, 100); // 5+ sentences = max score
  const lengthScore = lengthRatio * 100;

  const coherence = (sentenceScore * 0.6 + lengthScore * 0.4);

  return Math.round(coherence * 100) / 100;
}

/**
 * Evaluate an answer against ground truth
 */
export function evaluateAnswer(
  pairId: string,
  actualAnswer: string
): EvaluationResult | null {
  const pair = groundTruthPair(pairId);
  if (!pair) {
    logger.error(`Ground truth pair not found: ${pairId}`);
    return null;
  }

  const faithfulness = calculateFaithfulness(actualAnswer, pair.expectedAnswer);
  const relevance = calculateRelevance(actualAnswer, pair.expectedAnswer);
  const coherence = calculateCoherence(actualAnswer);

  // RAGAS score is average of the three metrics
  const ragas_score = (faithfulness + relevance + coherence) / 3;

  const result: EvaluationResult = {
    pairId,
    actualAnswer,
    ragas_score: Math.round(ragas_score * 100) / 100,
    faithfulness,
    relevance,
    coherence,
    timestamp: Date.now(),
  };

  // Store result
  const results = evaluationResults.get(pairId) || [];
  results.push(result);
  evaluationResults.set(pairId, results);

  logger.info(
    `Evaluated answer for pair ${pairId}. RAGAS: ${result.ragas_score}, Faithfulness: ${faithfulness}, Relevance: ${relevance}, Coherence: ${coherence}`
  );

  return result;
}

/**
 * Get evaluation results for a specific pair
 */
export function getEvaluationResults(pairId: string): EvaluationResult[] {
  return evaluationResults.get(pairId) || [];
}

/**
 * Calculate aggregate metrics across all evaluations
 */
export function calculateMetrics(): EvaluationMetrics {
  const allResults: EvaluationResult[] = [];

  evaluationResults.forEach((results) => {
    allResults.push(...results);
  });

  if (allResults.length === 0) {
    return {
      totalEvaluations: 0,
      avgRagasScore: 0,
      avgFaithfulness: 0,
      avgRelevance: 0,
      avgCoherence: 0,
      results: [],
    };
  }

  const avgRagasScore =
    allResults.reduce((sum, r) => sum + r.ragas_score, 0) / allResults.length;
  const avgFaithfulness =
    allResults.reduce((sum, r) => sum + r.faithfulness, 0) / allResults.length;
  const avgRelevance =
    allResults.reduce((sum, r) => sum + r.relevance, 0) / allResults.length;
  const avgCoherence =
    allResults.reduce((sum, r) => sum + r.coherence, 0) / allResults.length;

  cumulativeMetrics = {
    totalEvaluations: allResults.length,
    avgRagasScore: Math.round(avgRagasScore * 100) / 100,
    avgFaithfulness: Math.round(avgFaithfulness * 100) / 100,
    avgRelevance: Math.round(avgRelevance * 100) / 100,
    avgCoherence: Math.round(avgCoherence * 100) / 100,
    results: allResults.slice(-50), // Keep last 50
  };

  return cumulativeMetrics;
}

/**
 * Get current metrics
 */
export function getMetrics(): EvaluationMetrics {
  return calculateMetrics();
}

/**
 * Calculate score trends over time
 */
export function calculateTrends(): ScoreTrend[] {
  const trends: Map<string, { scores: number[]; count: number }> = new Map();

  evaluationResults.forEach((results) => {
    results.forEach((result) => {
      const date = new Date(result.timestamp).toISOString().split('T')[0];
      const existing = trends.get(date) || { scores: [], count: 0 };

      existing.scores.push(result.ragas_score);
      existing.count += 1;

      trends.set(date, existing);
    });
  });

  return Array.from(trends.entries())
    .map(([date, data]) => ({
      date,
      avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get score distribution statistics
 */
export function getScoreDistribution(): object {
  const allResults: EvaluationResult[] = [];

  evaluationResults.forEach((results) => {
    allResults.push(...results);
  });

  if (allResults.length === 0) {
    return {
      distribution: {},
      percentiles: {},
    };
  }

  const scores = allResults.map((r) => r.ragas_score).sort((a, b) => a - b);

  // Create distribution buckets (0-20, 20-40, etc.)
  const distribution: Record<string, number> = {
    '0-20': 0,
    '20-40': 0,
    '40-60': 0,
    '60-80': 0,
    '80-100': 0,
  };

  scores.forEach((score) => {
    if (score < 20) distribution['0-20']++;
    else if (score < 40) distribution['20-40']++;
    else if (score < 60) distribution['40-60']++;
    else if (score < 80) distribution['60-80']++;
    else distribution['80-100']++;
  });

  const percentiles = {
    p50: scores[Math.floor(scores.length * 0.5)],
    p75: scores[Math.floor(scores.length * 0.75)],
    p90: scores[Math.floor(scores.length * 0.9)],
    p95: scores[Math.floor(scores.length * 0.95)],
  };

  return { distribution, percentiles };
}

/**
 * Batch evaluate multiple answers
 */
export async function batchEvaluate(
  evaluations: Array<{ pairId: string; actualAnswer: string }>
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];

  for (const evaluation of evaluations) {
    const result = evaluateAnswer(evaluation.pairId, evaluation.actualAnswer);
    if (result) {
      results.push(result);
    }
  }

  logger.info(`Batch evaluated ${results.length} answers`);
  return results;
}

/**
 * Get quality assessment report
 */
export function getQualityReport(): object {
  const metrics = calculateMetrics();
  const trends = calculateTrends();
  const distribution = getScoreDistribution();

  let qualityLevel = 'Poor';
  if (metrics.avgRagasScore >= 80) qualityLevel = 'Excellent';
  else if (metrics.avgRagasScore >= 60) qualityLevel = 'Good';
  else if (metrics.avgRagasScore >= 40) qualityLevel = 'Fair';

  return {
    timestamp: new Date().toISOString(),
    summaryMetrics: metrics,
    qualityLevel,
    trends,
    distribution,
    recommendations: [
      metrics.avgFaithfulness < 60 && 'Focus on ensuring answers are supported by source material',
      metrics.avgRelevance < 60 && 'Improve retrieval to surface more relevant information',
      metrics.avgCoherence < 60 && 'Enhance answer formatting and structure',
    ].filter(Boolean),
  };
}

/**
 * Clear all evaluation data
 */
export function clearAll(): void {
  groundTruthPairs.clear();
  evaluationResults.clear();
  cumulativeMetrics = {
    totalEvaluations: 0,
    avgRagasScore: 0,
    avgFaithfulness: 0,
    avgRelevance: 0,
    avgCoherence: 0,
    results: [],
  };
  logger.info('Cleared all RAGAS evaluation data');
}

/**
 * Export all data as JSON
 */
export function exportData(): string {
  return JSON.stringify(
    {
      groundTruthPairs: Array.from(groundTruthPairs.values()),
      evaluationResults: Array.from(evaluationResults.entries()).map(([key, results]) => ({
        pairId: key,
        results,
      })),
      metrics: calculateMetrics(),
      trends: calculateTrends(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Helper function - get ground truth pair (fixing typo in function name)
 */
function groundTruthPair(id: string): GroundTruthPair | undefined {
  return groundTruthPairs.get(id);
}