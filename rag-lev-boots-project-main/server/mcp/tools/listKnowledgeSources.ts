/**
 * list_knowledge_sources tool - List available PDFs and articles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { MCPTool, KnowledgeSourcesList } from '../types.js';
import { ListKnowledgeSourcesInputSchema, zodToJsonSchema } from '../schemas.js';
import { createErrorResponse, createSuccessResponse } from '../utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Article IDs - duplicated from articleLoader.ts to avoid dependencies
 */
const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety'
];

/**
 * Tool definition for MCP
 */
const definition = {
  name: 'list_knowledge_sources',
  description: 'List all available knowledge sources in the Lev-Boots database. ' +
    'Returns PDFs and articles that can be read using the read_source tool. ' +
    'Useful for discovering what content is available before reading specific sources.',
  inputSchema: zodToJsonSchema(ListKnowledgeSourcesInputSchema)
};

/**
 * Tool handler - lists all knowledge sources
 */
async function handler(_args: unknown) {
  try {
    console.error('[list_knowledge_sources] Fetching available sources...');

    // Suppress stdout during file I/O
    const originalWrite = process.stdout.write;
    let suppressedOutput = '';
    process.stdout.write = (chunk: any): boolean => {
      suppressedOutput += chunk;
      return true;
    };

    let sources: KnowledgeSourcesList;
    try {
      // Get PDF files from knowledge_pdfs directory
      const pdfDirectory = path.join(__dirname, '..', '..', 'knowledge_pdfs');

      // Check if directory exists
      if (!fs.existsSync(pdfDirectory)) {
        throw new Error(`PDF directory not found: ${pdfDirectory}`);
      }

      const pdfFiles = fs.readdirSync(pdfDirectory)
        .filter(file => file.endsWith('.pdf'));

      // Build response object
      sources = {
        pdfs: pdfFiles.map(filename => ({
          type: 'pdf' as const,
          name: filename
        })),
        articles: ARTICLE_IDS.map(id => ({
          type: 'article' as const,
          id
        }))
      };
    } finally {
      process.stdout.write = originalWrite;
      if (suppressedOutput) {
        console.error(`[list_knowledge_sources] Suppressed ${suppressedOutput.length} bytes of output`);
      }
    }

    console.error(`[list_knowledge_sources] Found ${sources.pdfs.length} PDFs and ${sources.articles.length} articles`);

    // Format as readable text
    const formattedText = formatSourcesList(sources);
    return createSuccessResponse(formattedText);

  } catch (error) {
    return createErrorResponse(error, 'list_knowledge_sources');
  }
}

/**
 * Format sources list as markdown
 */
function formatSourcesList(sources: KnowledgeSourcesList): string {
  const lines: string[] = ['# Available Knowledge Sources\n'];

  lines.push(`## PDFs (${sources.pdfs.length})`);
  sources.pdfs.forEach((pdf, idx) => {
    lines.push(`${idx + 1}. ${pdf.name}`);
  });

  lines.push(`\n## Articles (${sources.articles.length})`);
  sources.articles.forEach((article, idx) => {
    lines.push(`${idx + 1}. ${article.id}`);
  });

  lines.push('\n\nUse the `read_source` tool to read the full content of any source.');

  return lines.join('\n');
}

/**
 * Export as MCPTool
 */
export const listKnowledgeSourcesTool: MCPTool = {
  definition,
  handler
};
