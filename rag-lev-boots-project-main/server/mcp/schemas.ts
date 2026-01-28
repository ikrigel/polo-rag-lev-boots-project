/**
 * Zod schemas for MCP tool input validation
 */

import { z } from 'zod';

/**
 * rag_search tool input schema
 */
export const RagSearchInputSchema = z.object({
  question: z.string()
    .min(1, 'Question cannot be empty')
    .max(1000, 'Question too long (max 1000 characters)')
});

export type RagSearchInput = z.infer<typeof RagSearchInputSchema>;

/**
 * list_knowledge_sources tool input schema (no input)
 */
export const ListKnowledgeSourcesInputSchema = z.object({});

export type ListKnowledgeSourcesInput = z.infer<typeof ListKnowledgeSourcesInputSchema>;

/**
 * read_source tool input schema
 */
export const ReadSourceInputSchema = z.object({
  sourceName: z.string()
    .min(1, 'Source name cannot be empty'),
  sourceType: z.enum(['pdf', 'article']).optional()
});

export type ReadSourceInput = z.infer<typeof ReadSourceInputSchema>;

/**
 * Helper to convert Zod schema to JSON Schema for MCP
 * This creates the inputSchema that MCP clients expect
 */
export function zodToJsonSchema(schema: z.ZodType): any {
  try {
    const schemaAny = schema as any;

    // Handle ZodObject - the main case for our tool inputs
    if (schemaAny._def && schemaAny._def.shape) {
      const shape = typeof schemaAny._def.shape === 'function'
        ? schemaAny._def.shape()
        : schemaAny._def.shape;

      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const fieldType = value as any;
        let isRequired = true;
        let fieldDef: any = { type: 'string' };

        // Check if optional (wrapped in ZodUnion with undefined)
        if (fieldType._def && fieldType._def.innerType) {
          // This is a ZodOptional (Union with undefined)
          isRequired = false;
          const inner = fieldType._def.innerType;
          if (inner._def && inner._def.values) {
            // Enum
            fieldDef = {
              type: 'string',
              enum: inner._def.values
            };
          }
        } else if (fieldType._def && fieldType._def.values) {
          // ZodEnum
          fieldDef = {
            type: 'string',
            enum: fieldType._def.values
          };
        }

        properties[key] = fieldDef;

        if (isRequired) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {})
      };
    }
  } catch (error) {
    console.error('Error converting Zod schema to JSON schema:', error);
  }

  return { type: 'object' };
}
