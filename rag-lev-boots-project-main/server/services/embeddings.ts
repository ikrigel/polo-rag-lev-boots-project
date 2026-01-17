import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const GEMINI_API_KEY = process.env.Gemini_API_KEY;
const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSION = 768; // Gemini text-embedding-004 returns 768 dimensions
const DELAY_BETWEEN_BATCHES = 1000; // ms
const REQUEST_TIMEOUT = 30000; // 30 second timeout for API calls
const MAX_RETRIES = 3; // Retry failed requests up to 3 times

if (!GEMINI_API_KEY) {
  logger.error('Gemini_API_KEY environment variable is missing');
  throw new Error('Gemini_API_KEY environment variable is required');
}

logger.debug('Embeddings service initialized', {
  model: EMBEDDING_MODEL,
  dimension: EMBEDDING_DIMENSION,
  delayBetweenBatches: DELAY_BETWEEN_BATCHES,
});

const client = new GoogleGenerativeAI(GEMINI_API_KEY);

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper to add timeout to async operations
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
};

// Retry logic for failed requests
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxAttempts: number = MAX_RETRIES
): Promise<any> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await withTimeout(fn(), REQUEST_TIMEOUT);
    } catch (error) {
      lastError = error;
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Attempt ${attempt}/${maxAttempts} failed: ${errorMsg}`);

      // Don't retry on last attempt
      if (attempt < maxAttempts) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // exponential backoff, max 10s
        logger.info(`Retrying in ${backoffTime}ms...`);
        await delay(backoffTime);
      }
    }
  }

  throw lastError;
};

export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  if (texts.length === 0) {
    logger.info('No texts provided for embedding generation');
    return [];
  }

  logger.info(`Starting embedding generation for ${texts.length} texts`);
  const embeddings: number[][] = [];
  const startTime = Date.now();

  // Process texts one by one to ensure proper handling
  for (let i = 0; i < texts.length; i++) {
    try {
      logger.debug(`Generating embedding ${i + 1}/${texts.length}`, {
        textLength: texts[i].length,
      });

      const embeddingResponse = await retryWithBackoff(async () => {
        return await client
          .getGenerativeModel({ model: EMBEDDING_MODEL })
          .embedContent(texts[i]);
      });

      const embeddingData = embeddingResponse.embedding;

      if (!embeddingData) {
        logger.error(`No embedding returned for text ${i}`, { textLength: texts[i].length });
        throw new Error(`No embedding returned for text at index ${i}`);
      }

      let embeddingValues: number[];

      // Handle both API response formats
      if (Array.isArray(embeddingData)) {
        embeddingValues = embeddingData;
      } else if (embeddingData && typeof embeddingData === 'object' && 'values' in embeddingData) {
        embeddingValues = (embeddingData as any).values;
      } else {
        logger.error(`Invalid embedding format for text ${i}`, { embeddingData });
        throw new Error(`Invalid embedding format at index ${i}`);
      }

      if (!Array.isArray(embeddingValues) || typeof embeddingValues[0] !== 'number') {
        logger.error(`Embedding values are not a valid number array for text ${i}`, {
          isArray: Array.isArray(embeddingValues),
          firstElement: embeddingValues?.[0],
        });
        throw new Error(`Invalid embedding values at index ${i}`);
      }

      embeddings.push(embeddingValues);
      logger.debug(`Embedding ${i + 1} generated successfully`, {
        dimension: embeddingValues.length,
      });

      if ((i + 1) % 10 === 0) {
        logger.info(`Progress: Generated embeddings ${i + 1}/${texts.length}`);
      }

      // Add delay between requests to avoid rate limiting
      if (i < texts.length - 1) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to generate embedding for text ${i}`, error);
      throw new Error(`Embedding generation failed at index ${i}: ${errorMsg}`);
    }
  }

  const duration = Date.now() - startTime;
  logger.info(`Completed embedding generation`, {
    totalGenerated: embeddings.length,
    totalRequested: texts.length,
    duration: `${duration}ms`,
    avgTimePerEmbedding: `${Math.round(duration / texts.length)}ms`,
  });

  return embeddings;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    logger.debug('Generating single embedding', { textLength: text.length });

    const embeddingResponse = await retryWithBackoff(async () => {
      return await client.getGenerativeModel({ model: EMBEDDING_MODEL }).embedContent(text);
    });

    const embeddingData = embeddingResponse.embedding;

    if (!embeddingData) {
      logger.error('No embedding returned from API');
      throw new Error('No embedding returned from API');
    }

    let embeddingValues: number[];

    // Handle both API response formats
    if (Array.isArray(embeddingData)) {
      embeddingValues = embeddingData;
    } else if (embeddingData && typeof embeddingData === 'object' && 'values' in embeddingData) {
      embeddingValues = (embeddingData as any).values;
    } else {
      logger.error('Invalid embedding response format', { embeddingData });
      throw new Error('Invalid embedding response format');
    }

    if (!Array.isArray(embeddingValues) || typeof embeddingValues[0] !== 'number') {
      logger.error('Embedding values are not a valid number array', {
        isArray: Array.isArray(embeddingValues),
        firstElement: embeddingValues?.[0],
      });
      throw new Error('Invalid embedding values format');
    }

    logger.debug('Single embedding generated successfully', { dimension: embeddingValues.length });
    return embeddingValues;
  } catch (error) {
    logger.error('Error generating single embedding', error);
    throw error;
  }
};

export const getEmbeddingDimension = (): number => {
  return EMBEDDING_DIMENSION;
};
