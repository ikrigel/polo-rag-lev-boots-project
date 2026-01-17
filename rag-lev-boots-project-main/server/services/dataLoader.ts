import KnowledgeBase from '../models/KnowledgeBase.js';
import { loadPDFs } from './pdfLoader.js';
import { loadArticles } from './articleLoader.js';
import { loadSlackMessages } from './slackLoader.js';
import { chunkAllContent } from './chunking.js';
import { generateEmbeddings, getEmbeddingDimension } from './embeddings.js';
import logger from '../utils/logger.js';

interface ChunkWithEmbedding {
  content: string;
  sourceId: string;
  sourceType: 'pdf' | 'article' | 'slack';
  chunkIndex: number;
  metadata: {
    source: string;
    chunkCount?: number;
  };
  embedding: number[];
}

export const loadAllData = async (): Promise<void> => {
  logger.section('🚀 Starting Data Loading Pipeline');

  try {
    // Step 1: Load all data from sources
    logger.info('Step 1: Loading data from sources...');
    let pdfs: any[] = [];
    let articles: any[] = [];
    let slackMessages: any[] = [];

    try {
      pdfs = await loadPDFs();
      logger.debug(`PDFs loaded successfully`, { count: pdfs.length });
    } catch (error) {
      logger.error('Failed to load PDFs', error);
      pdfs = [];
    }

    try {
      articles = await loadArticles();
      logger.debug(`Articles loaded successfully`, { count: articles.length });
    } catch (error) {
      logger.error('Failed to load articles', error);
      articles = [];
    }

    try {
      slackMessages = await loadSlackMessages();
      logger.debug(`Slack messages loaded successfully`, { count: slackMessages.length });
    } catch (error) {
      logger.error('Failed to load Slack messages', error);
      slackMessages = [];
    }

    logger.info('Data loading complete', {
      pdfs: pdfs.length,
      articles: articles.length,
      slackMessages: slackMessages.length,
    });

    // Step 2: Chunk content
    logger.info('Step 2: Chunking content...');
    let chunks;
    try {
      chunks = chunkAllContent(pdfs, articles, slackMessages);
      logger.info(`Total chunks created: ${chunks.length}`);
    } catch (error) {
      logger.error('Failed to chunk content', error);
      throw error;
    }

    // Step 3: Check existing data
    logger.info('Step 3: Checking for existing data...');
    let existingCount;
    try {
      existingCount = await KnowledgeBase.count();
      logger.info(`Current KB entries: ${existingCount}`);
    } catch (error) {
      logger.error('Failed to check existing KB count', error);
      throw error;
    }

    if (existingCount > 0) {
      logger.warn('Database already contains data. Skipping duplicate embeddings.');
      return;
    }

    // Step 4: Generate embeddings
    logger.info('Step 4: Generating embeddings...');
    let embeddings;
    try {
      const chunkContents = chunks.map(c => c.content);
      logger.debug(`Preparing to generate ${chunkContents.length} embeddings`);
      embeddings = await generateEmbeddings(chunkContents);
      logger.info(`Generated ${embeddings.length} embeddings successfully`);
    } catch (error) {
      logger.error('Failed to generate embeddings', error);
      throw error;
    }

    if (embeddings.length !== chunks.length) {
      const mismatchError = `Embedding count mismatch: got ${embeddings.length}, expected ${chunks.length}`;
      logger.error(mismatchError);
      throw new Error(mismatchError);
    }

    // Step 5: Prepare data for storage
    logger.info('Step 5: Preparing and storing data in database...');
    let embeddingDimension: number;
    try {
      embeddingDimension = getEmbeddingDimension();
      const chunksWithEmbeddings: ChunkWithEmbedding[] = chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index],
      }));

      // Step 6: Store in database
      const batchSize = 50;
      for (let i = 0; i < chunksWithEmbeddings.length; i += batchSize) {
        const batch = chunksWithEmbeddings.slice(i, i + batchSize);

        const records = batch.map(chunk => ({
          source: chunk.metadata.source,
          source_id: chunk.sourceId,
          chunk_index: chunk.chunkIndex,
          chunk_content: chunk.content,
          embeddings_1536: embeddingDimension === 1536 ? chunk.embedding : null,
          embeddings_768: embeddingDimension === 768 ? chunk.embedding : null,
        }));

        try {
          await KnowledgeBase.bulkCreate(records);
          const progress = Math.min(i + batchSize, chunksWithEmbeddings.length);
          logger.debug(`Stored ${progress}/${chunksWithEmbeddings.length} chunks`);
        } catch (error) {
          logger.error(`Failed to store batch at index ${i}`, error);
          throw error;
        }
      }

      logger.section('✅ Data Loading Complete!');
      logger.info('Summary', {
        totalChunks: chunksWithEmbeddings.length,
        embeddingDimension,
        destination: 'knowledge_base table',
      });
    } catch (error) {
      logger.error('Failed during data preparation or storage', error);
      throw error;
    }
  } catch (error) {
    logger.error('Fatal error during data loading', error);
    throw error;
  }
};

export const clearKnowledgeBase = async (): Promise<void> => {
  try {
    console.log('Clearing knowledge_base table...');
    await KnowledgeBase.destroy({ where: {} });
    console.log('✓ Knowledge base cleared');
  } catch (error) {
    console.error('Error clearing knowledge base:', error);
    throw error;
  }
};
