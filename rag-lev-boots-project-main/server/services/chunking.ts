interface Chunk {
  content: string;
  sourceId: string;
  sourceType: 'pdf' | 'article' | 'slack';
  chunkIndex: number;
  metadata: {
    source: string;
    chunkCount?: number;
  };
}

const CHUNK_SIZE = 400; // words per chunk
const CHUNK_OVERLAP = 50; // words of overlap between chunks

export const chunkContent = (
  content: string,
  sourceId: string,
  sourceType: 'pdf' | 'article' | 'slack',
  source: string
): Chunk[] => {
  // Split content into sentences for better boundaries
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];

  const words: string[] = [];
  for (const sentence of sentences) {
    words.push(...sentence.split(/\s+/));
  }

  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  for (let i = 0; i < words.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunkWords = words.slice(i, i + CHUNK_SIZE);

    if (chunkWords.length === 0) continue;

    const chunkContent = chunkWords.join(' ').trim();

    if (chunkContent.length < 50) continue; // Skip very small chunks

    chunks.push({
      content: chunkContent,
      sourceId,
      sourceType,
      chunkIndex,
      metadata: {
        source,
        chunkCount: Math.ceil(words.length / (CHUNK_SIZE - CHUNK_OVERLAP)),
      },
    });

    chunkIndex++;
  }

  return chunks;
};

export const chunkAllContent = (
  pdfs: Array<{ filename: string; text: string }>,
  articles: Array<{ id: string; title: string; content: string }>,
  slackMessages: Array<{ channel: string; text: string; timestamp: string }>
): Chunk[] => {
  const allChunks: Chunk[] = [];

  // Chunk PDFs
  for (const pdf of pdfs) {
    const chunks = chunkContent(pdf.text, pdf.filename, 'pdf', pdf.filename);
    allChunks.push(...chunks);
    console.log(`✓ Chunked PDF "${pdf.filename}": ${chunks.length} chunks`);
  }

  // Chunk Articles
  for (const article of articles) {
    const chunks = chunkContent(article.content, article.id, 'article', article.title);
    allChunks.push(...chunks);
    console.log(`✓ Chunked Article "${article.title}": ${chunks.length} chunks`);
  }

  // Chunk Slack messages (group by channel)
  const messagesByChannel = slackMessages.reduce(
    (acc, msg) => {
      if (!acc[msg.channel]) acc[msg.channel] = [];
      acc[msg.channel].push(msg.text);
      return acc;
    },
    {} as Record<string, string[]>
  );

  for (const [channel, messages] of Object.entries(messagesByChannel)) {
    const combinedText = messages.join(' ');
    const chunks = chunkContent(combinedText, channel, 'slack', `Slack #${channel}`);
    allChunks.push(...chunks);
    console.log(`✓ Chunked Slack channel "#${channel}": ${chunks.length} chunks`);
  }

  return allChunks;
};
