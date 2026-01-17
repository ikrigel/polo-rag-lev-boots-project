import sequelize from './server/config/database.js';
import KnowledgeBase from './server/models/KnowledgeBase.js';

async function verify() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Get overall stats
    const totalCount = await KnowledgeBase.count();
    console.log(`📊 Total Knowledge Base Entries: ${totalCount}\n`);

    // Get stats by source
    const entries = await KnowledgeBase.findAll({
      attributes: ['source', 'chunk_index', 'chunk_content', ['embeddings_768', 'embeddings_768']],
      raw: true,
      order: [['source', 'ASC'], ['chunk_index', 'ASC']],
    });

    // Group by source
    const bySource = {};
    entries.forEach(entry => {
      if (!bySource[entry.source]) {
        bySource[entry.source] = {
          count: 0,
          totalChars: 0,
          chunkIndices: [],
          hasEmbeddings: 0,
        };
      }
      bySource[entry.source].count++;
      bySource[entry.source].totalChars += (entry.chunk_content || '').length;
      bySource[entry.source].chunkIndices.push(entry.chunk_index);
      if (entry.embeddings_768 && Array.isArray(entry.embeddings_768) && entry.embeddings_768.length > 0) {
        bySource[entry.source].hasEmbeddings++;
      }
    });

    console.log('📁 Breakdown by Source:\n');
    Object.entries(bySource).forEach(([source, stats]) => {
      console.log(`  ${source}:`);
      console.log(`    - Chunks: ${stats.count}`);
      console.log(`    - Total characters: ${stats.totalChars}`);
      console.log(`    - With embeddings: ${stats.hasEmbeddings}/${stats.count}`);
      console.log(`    - Chunk indices: ${stats.chunkIndices.join(', ')}`);
      console.log();
    });

    // Sample chunks
    console.log('\n📝 Sample Chunks (first 3):\n');
    entries.slice(0, 3).forEach((entry, idx) => {
      console.log(`[${idx + 1}] Source: ${entry.source}, Chunk ${entry.chunk_index}`);
      console.log(`    Content preview: ${entry.chunk_content?.substring(0, 100)}...`);
      console.log(`    Embedding dimensions: ${entry.embeddings_768 ? entry.embeddings_768.length : 'MISSING'}`);
      console.log();
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
