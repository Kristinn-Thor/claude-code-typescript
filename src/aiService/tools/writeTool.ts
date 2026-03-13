import fs from 'fs';
import type {ToolResponse} from './toolParser.js';

/**
 * Writes the contents of a file at the given path.
 * If the file does not exist, it will be created.
 * If it does exist, it will be overwritten.
 * @param filePath The path to the file to write to
 * @param content The content to write to the file
 * @returns ToolResponse
 */
export default function writeTool(
  filePath: string,
  newContent: string,
  toolCallId: string,
): ToolResponse {
  // For security reasons, we don't allow writing to .env files or any files outside of this package directory.
  if (filePath.includes('.env') || filePath.includes('..')) {
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: 'Error: Access to the specified file is not allowed',
    };
  }
  // Write the content to the file.
  try {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: newContent,
    };
  } catch {
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: `Error writing file`,
    };
  }
}

export const WriteTool = {
  type: 'function',
  function: {
    name: 'Write',
    description: 'Write content to a file',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path to the file to write to',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['file_path', 'content'],
    },
  },
} as const;
