import fs from 'fs';
import type {ToolResponse} from './toolParser';

/**
 * Reads the contents of a file at the given path.
 * @param filePath The path to the file to read
 * @returns ToolResponse
 */
export default function readTool(
  filePath: string,
  toolCallId: string,
): ToolResponse {
  // For security reasons, we don't allow reading .env files or any files outside of this package directory.
  if (filePath.includes('.env') || filePath.includes('..')) {
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: 'Error: Access to the specified file is not allowed',
    };
  }
  // Read the file and return its contents.
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: data,
    };
  } catch (err) {
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: `Error reading file`,
    };
  }
}

export const ReadTool = {
  type: 'function',
  function: {
    name: 'Read',
    description: 'Read and return the contents of a file',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The path to the file to read',
        },
      },
      required: ['file_path'],
    },
  },
} as const;
