/**
 * Shared TypeScript types and interfaces for MCP server
 */

/**
 * MCP Tool definition - metadata about a tool
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * MCP Tool implementation - definition + handler
 */
export interface MCPTool<TInput = any, TOutput = any> {
  definition: MCPToolDefinition;
  handler: (args: TInput) => Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }>;
}

/**
 * Knowledge source types
 */
export interface PDFSource {
  type: 'pdf';
  name: string;
}

export interface ArticleSource {
  type: 'article';
  id: string;
}

/**
 * Combined knowledge sources list
 */
export interface KnowledgeSourcesList {
  pdfs: PDFSource[];
  articles: ArticleSource[];
}

/**
 * RAG response from existing ragService.ask()
 */
export interface RAGResponse {
  answer: string;
  sources: string[];
  bibliography?: string[];
  error?: string;
}
