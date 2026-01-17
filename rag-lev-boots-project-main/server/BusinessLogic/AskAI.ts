import KnowledgeBase from '../models/KnowledgeBase.js';
import { generateEmbedding, getEmbeddingDimension } from '../services/embeddings.js';
import axios from 'axios';
import logger from '../utils/logger.js';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_MODEL = 'sonar';
const SIMILARITY_THRESHOLD = 0.3; // Lowered from 0.5 to be less strict
const TOP_K = 5; // Number of chunks to retrieve

if (!PERPLEXITY_API_KEY) {
  console.warn('⚠️  PERPLEXITY_API_KEY not found in environment variables');
}

interface RetrievedChunk {
  content: string;
  source: string;
  similarity: number;
}

interface AskResponse {
  answer: string;
  sources: string[];
  bibliography?: string[];
  error?: string;
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
};

/**
 * Retrieve relevant chunks from the knowledge base using vector similarity search
 */
const retrieveRelevantChunks = async (questionEmbedding: number[]): Promise<RetrievedChunk[]> => {
  try {
    // Get all knowledge base entries
    const allEntries = await KnowledgeBase.findAll({
      attributes: ['chunk_content', 'source', 'embeddings_1536', 'embeddings_768'],
      raw: true,
    });

    if (allEntries.length === 0) {
      logger.warn('No entries in knowledge base');
      return [];
    }

    logger.debug('Retrieved KB entries', {
      count: allEntries.length,
      firstEntry: allEntries[0] ? {
        source: (allEntries[0] as any).source,
        hasEmbeddings768: !!((allEntries[0] as any).embeddings_768),
        embeddings768Type: typeof (allEntries[0] as any).embeddings_768,
        embeddings768IsArray: Array.isArray((allEntries[0] as any).embeddings_768),
        embeddings768Length: Array.isArray((allEntries[0] as any).embeddings_768) ? (allEntries[0] as any).embeddings_768.length : null,
      } : null,
    });

    // Calculate similarity for each entry
    const similarities: RetrievedChunk[] = [];
    const embeddingDim = getEmbeddingDimension();
    const allSimilarities: { source: string; similarity: number }[] = [];
    let skippedCount = 0;

    for (const entry of allEntries) {
      const embeddingKey = embeddingDim === 1536 ? 'embeddings_1536' : 'embeddings_768';
      let embedding = (entry as any)[embeddingKey];

      // Handle case where embedding might be a string representation
      if (typeof embedding === 'string') {
        try {
          embedding = JSON.parse(embedding);
        } catch {
          skippedCount++;
          continue;
        }
      }

      if (!embedding || !Array.isArray(embedding)) {
        skippedCount++;
        continue;
      }

      const similarity = cosineSimilarity(questionEmbedding, embedding);
      allSimilarities.push({
        source: (entry as any).source,
        similarity,
      });

      if (similarity >= SIMILARITY_THRESHOLD) {
        similarities.push({
          content: (entry as any).chunk_content,
          source: (entry as any).source,
          similarity,
        });
      }
    }

    // Log top similarities for debugging
    const topSimilarities = allSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    logger.info('Similarity search results', {
      totalEntries: allEntries.length,
      threshold: SIMILARITY_THRESHOLD,
      skipped: skippedCount,
      processed: allSimilarities.length,
      matchesFound: similarities.length,
      topScores: topSimilarities,
    });

    // Sort by similarity and return top K
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, TOP_K);
  } catch (error) {
    logger.error('Error retrieving chunks', error);
    return [];
  }
};

/**
 * Construct a system prompt for the LLM
 */
const constructSystemPrompt = (chunks: RetrievedChunk[]): string => {
  const context = chunks.map((chunk, index) => `Source ${index + 1}: ${chunk.source}\n${chunk.content}`).join('\n\n---\n\n');

  return `You are an AI assistant specialized in answering questions about Lev-Boots technology based on provided knowledge base documents.

You MUST follow these rules:
1. Only answer questions based on the provided context from the knowledge base
2. If the answer is not in the provided context, say "I don't have information about that in the knowledge base"
3. Write clear, simple paragraphs - avoid excessive markdown formatting
4. Use headings only for main sections (use # or ## sparingly)
5. Avoid bullet points when possible - use flowing prose instead
6. Be accurate, concise, and easy to read
7. Do not make up or assume information not in the context
8. Do NOT include [1], [2], etc. citations in your answer

KNOWLEDGE BASE CONTEXT:
${context}

---

Answer the user's question based ONLY on the above context. Make the answer clear and easy to read with simple, direct language.`;
};

/**
 * Ask a question to the AI using RAG (Retrieval-Augmented Generation)
 * 1. Embeds the user question
 * 2. Retrieves similar chunks from knowledge base
 * 3. Constructs prompt with context
 * 4. Calls Perplexity API for answer
 * 5. Returns answer with sources
 */
export const askAI = async (userQuestion: string): Promise<AskResponse> => {
  try {
    logger.info(`User question: ${userQuestion}`);

    // Step 1: Embed the user question
    logger.info('Embedding question...');
    const questionEmbedding = await generateEmbedding(userQuestion);

    if (!questionEmbedding || questionEmbedding.length === 0) {
      logger.error('Failed to embed question');
      return {
        answer: '',
        sources: [],
        error: 'Failed to embed question',
      };
    }

    // Step 2: Retrieve relevant chunks from knowledge base
    logger.info('Searching knowledge base...');
    const relevantChunks = await retrieveRelevantChunks(questionEmbedding);

    if (relevantChunks.length === 0) {
      logger.warn('No relevant chunks found in knowledge base');
      return {
        answer: 'I could not find any relevant information in the knowledge base to answer this question.',
        sources: [],
      };
    }

    logger.info(`Found ${relevantChunks.length} relevant chunks`);

    // Step 3: Construct system prompt with context
    const systemPrompt = constructSystemPrompt(relevantChunks);

    // Step 4: Call Perplexity API
    logger.info('Generating answer with Perplexity API...');

    if (!PERPLEXITY_API_KEY) {
      logger.error('PERPLEXITY_API_KEY not configured');
      return {
        answer: '',
        sources: [],
        error: 'PERPLEXITY_API_KEY not configured',
      };
    }

    const requestPayload = {
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userQuestion,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };

    logger.debug('Perplexity API request', {
      model: PERPLEXITY_MODEL,
      hasApiKey: !!PERPLEXITY_API_KEY,
      apiKeyLength: PERPLEXITY_API_KEY?.length || 0,
      messagesCount: requestPayload.messages.length,
    });

    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      let answer = response.data.choices?.[0]?.message?.content || '';

      // Remove inline citations like [1], [2], etc.
      answer = answer.replace(/\[\d+\]/g, '').trim();

      // Step 5: Extract unique sources
      const sources = [...new Set(relevantChunks.map(chunk => chunk.source))];

      logger.info('Answer generated successfully', { sources });

      return {
        answer,
        sources,
        bibliography: sources,
      };
    } catch (axiosError: any) {
      const errorStatus = axiosError.response?.status;
      const errorData = axiosError.response?.data;
      logger.error('Perplexity API error', {
        status: errorStatus,
        statusText: axiosError.response?.statusText,
        data: errorData,
        message: axiosError.message,
      });

      throw axiosError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error asking AI', error);

    return {
      answer: '',
      sources: [],
      error: `Failed to get answer: ${errorMessage}`,
    };
  }
};

/**
 * Get statistics about a question's matching results
 * (for debugging/analysis)
 */
export const getQuestionStats = async (userQuestion: string): Promise<{
  question: string;
  matchingChunks: number;
  topSources: string[];
  error?: string;
}> => {
  try {
    const questionEmbedding = await generateEmbedding(userQuestion);
    const relevantChunks = await retrieveRelevantChunks(questionEmbedding);

    return {
      question: userQuestion,
      matchingChunks: relevantChunks.length,
      topSources: [...new Set(relevantChunks.map(chunk => chunk.source))],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      question: userQuestion,
      matchingChunks: 0,
      topSources: [],
      error: errorMessage,
    };
  }
};
