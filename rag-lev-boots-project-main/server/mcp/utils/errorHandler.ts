/**
 * Error handling utilities for MCP tools
 */

/**
 * Create an error response in MCP format
 */
export function createErrorResponse(error: unknown, toolName: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Log to stderr for debugging (won't interfere with MCP protocol on stdout)
  console.error(`[${toolName}] Error: ${errorMessage}`);

  return {
    content: [
      {
        type: 'text',
        text: `Error: ${errorMessage}`
      }
    ],
    isError: true
  };
}

/**
 * Create a success response in MCP format
 */
export function createSuccessResponse(text: string) {
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  };
}

/**
 * Validate input with a Zod schema
 * Throws on validation failure
 */
export function validateInput<T>(
  schema: { parse: (input: unknown) => T },
  input: unknown,
  toolName: string
): T {
  try {
    return schema.parse(input);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[${toolName}] Validation failed: ${errorMsg}`);
    throw new Error(`Invalid input: ${errorMsg}`);
  }
}
