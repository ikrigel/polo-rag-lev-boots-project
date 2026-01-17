import axios from 'axios';

interface ArticleData {
  id: string;
  title: string;
  content: string;
}

const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety',
];

const GIST_BASE_URL =
  'https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw';

export const loadArticles = async (): Promise<ArticleData[]> => {
  const results: ArticleData[] = [];

  for (let i = 1; i <= ARTICLE_IDS.length; i++) {
    const articleId = ARTICLE_IDS[i - 1];
    const url = `${GIST_BASE_URL}/article-${i}_${articleId}.md`;

    try {
      const response = await axios.get(url, { timeout: 10000 });
      const content = response.data;

      results.push({
        id: articleId,
        title: `Article ${i}: ${articleId}`,
        content,
      });

      console.log(`✓ Loaded article: ${articleId} (${content.length} characters)`);
    } catch (error) {
      console.error(`✗ Error loading article ${articleId}:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  return results;
};
