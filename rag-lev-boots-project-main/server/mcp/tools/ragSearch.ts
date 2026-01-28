/**
 * rag_search tool - Query the Lev-Boots RAG system
 */

import { ask } from '../../services/ragService.js';
import type { MCPTool } from '../types.js';
import { RagSearchInputSchema, zodToJsonSchema } from '../schemas.js';
import { createErrorResponse, createSuccessResponse, validateInput } from '../utils/errorHandler.js';

/**
 * Tool definition for MCP
 */
const definition = {
  name: 'rag_search',
  description: 'Search the Lev-Boots knowledge base using RAG (Retrieval Augmented Generation). ' +
    'Answers questions about Lev-Boots gravitational reversal technology, including technical details, ' +
    'applications, safety, deployment, and research findings. Returns answer with sources.',
  inputSchema: zodToJsonSchema(RagSearchInputSchema)
};

/**
 * Tool handler - processes tool calls
 */
async function handler(args: unknown) {
  try {
    // Validate input with Zod schema
    const { question } = validateInput(RagSearchInputSchema, args, 'rag_search');

    console.error(`[rag_search] Processing question: "${question.substring(0, 50)}..."`);

    // Suppress stdout during RAG service call to prevent MCP protocol corruption
    const originalWrite = process.stdout.write;
    let suppressedOutput = '';
    process.stdout.write = (chunk: any): boolean => {
      suppressedOutput += chunk;
      return true;
    };

    let response;
    try {
      // Call existing RAG service
      response = await ask(question);
    } finally {
      // Restore stdout
      process.stdout.write = originalWrite;
      if (suppressedOutput) {
        console.error(`[rag_search] Suppressed ${suppressedOutput.length} bytes of output from RAG service`);
      }
    }

    // Handle errors from RAG system
    if (response.error) {
      return createErrorResponse(
        new Error(response.error),
        'rag_search'
      );
    }

    // Format successful response
    const formattedAnswer = formatRagResponse(response);
    return createSuccessResponse(formattedAnswer);

  } catch (error) {
    return createErrorResponse(error, 'rag_search');
  }
}

/**
 * Format RAG response with sources and bibliography
 */
function formatRagResponse(response: {
  answer: string;
  sources: string[];
  bibliography?: string[];
}): string {
  let result = response.answer;

  // Add sources if available
  if (response.sources && response.sources.length > 0) {
    result += '\n\n**Sources Used:**\n';
    response.sources.forEach((source, idx) => {
      result += `${idx + 1}. ${source}\n`;
    });
  }

  // Add bibliography if available
  if (response.bibliography && response.bibliography.length > 0) {
    result += '\n**Bibliography:**\n';
    response.bibliography.forEach((ref, idx) => {
      result += `${idx + 1}. ${ref}\n`;
    });
  }

  return result;
}

/**
 * Export as MCPTool
 */
export const ragSearchTool: MCPTool = {
  definition,
  handler
};
