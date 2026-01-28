/**
 * read_source tool - Read full content of PDFs and articles
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fileURLToPath } from 'url';
import type { MCPTool } from '../types.js';
import { ReadSourceInputSchema, zodToJsonSchema } from '../schemas.js';
import { createErrorResponse, createSuccessResponse, validateInput } from '../utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Article IDs - duplicated from articleLoader.ts
 */
const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety'
];

/**
 * GitHub Gist base URL for articles
 */
const GIST_BASE_URL = 'https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw';

/**
 * Tool definition for MCP
 */
const definition = {
  name: 'read_source',
  description: 'Read the full text content of a PDF or article from the Lev-Boots knowledge base. ' +
    'Provide the source name (PDF filename or article ID) and optionally the source type. ' +
    'If type is not specified, it will be auto-detected. ' +
    'Use list_knowledge_sources first to see available sources.',
  inputSchema: zodToJsonSchema(ReadSourceInputSchema)
};

/**
 * Tool handler - reads source content
 */
async function handler(args: unknown) {
  try {
    const validated = validateInput(ReadSourceInputSchema, args, 'read_source');
    const { sourceName, sourceType } = validated;

    console.error(`[read_source] Reading source: "${sourceName}" (type: ${sourceType || 'auto-detect'})`);

    // Auto-detect source type if not provided
    const detectedType = sourceType || detectSourceType(sourceName);

    // Suppress stdout during file/network I/O to prevent MCP protocol corruption
    const originalWrite = process.stdout.write;
    let suppressedOutput = '';
    process.stdout.write = (chunk: any): boolean => {
      suppressedOutput += chunk;
      return true;
    };

    let content: string;
    try {
      if (detectedType === 'pdf') {
        content = await readPDF(sourceName);
      } else if (detectedType === 'article') {
        content = await readArticle(sourceName);
      } else {
        throw new Error(`Could not determine source type for: ${sourceName}`);
      }
    } finally {
      process.stdout.write = originalWrite;
      if (suppressedOutput) {
        console.error(`[read_source] Suppressed ${suppressedOutput.length} bytes of output`);
      }
    }

    console.error(`[read_source] Successfully read source (${content.length} characters)`);

    return createSuccessResponse(content);

  } catch (error) {
    return createErrorResponse(error, 'read_source');
  }
}

/**
 * Auto-detect source type based on name
 */
function detectSourceType(sourceName: string): 'pdf' | 'article' | null {
  // Check if it looks like a PDF
  if (sourceName.toLowerCase().endsWith('.pdf')) {
    return 'pdf';
  }

  // Check if it's a known article ID
  if (ARTICLE_IDS.includes(sourceName)) {
    return 'article';
  }

  // Check if PDF exists in knowledge_pdfs directory
  const pdfDirectory = path.join(__dirname, '..', '..', 'knowledge_pdfs');
  if (fs.existsSync(pdfDirectory)) {
    const pdfFiles = fs.readdirSync(pdfDirectory);
    if (pdfFiles.some(file => file === sourceName || file === `${sourceName}.pdf`)) {
      return 'pdf';
    }
  }

  return null;
}

/**
 * Read and extract text from a PDF file
 */
async function readPDF(filename: string): Promise<string> {
  const pdfDirectory = path.join(__dirname, '..', '..', 'knowledge_pdfs');

  // Normalize filename (ensure .pdf extension)
  const normalizedFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const filePath = path.join(pdfDirectory, normalizedFilename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF not found: ${normalizedFilename}`);
  }

  // Read and extract text using pdfjs-dist
  const pdfBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

  let text = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (item.str ? item.str : ''))
      .join('');
    text += pageText + '\n\n';
  }

  return `# ${normalizedFilename}\n\n${text.trim()}`;
}

/**
 * Fetch and return article content from GitHub Gist
 */
async function readArticle(articleId: string): Promise<string> {
  // Find article index
  const articleIndex = ARTICLE_IDS.indexOf(articleId);

  if (articleIndex === -1) {
    throw new Error(`Article not found: ${articleId}. Available articles: ${ARTICLE_IDS.join(', ')}`);
  }

  // Construct URL (index is 1-based for URL)
  const articleNumber = articleIndex + 1;
  const url = `${GIST_BASE_URL}/article-${articleNumber}_${articleId}.md`;

  console.error(`[read_source] Fetching article from: ${url}`);

  try {
    const response = await axios.get(url, { timeout: 10000 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch article: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Export as MCPTool
 */
export const readSourceTool: MCPTool = {
  definition,
  handler
};
