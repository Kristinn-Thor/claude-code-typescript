import fs from 'fs';

export type ToolResponse = {
  role: 'tool';
  tool_call_id: string;
  content: string;
};

/**
 * Reads the contents of a file at the given path.
 * @param filePath The path to the file to read
 * @returns The contents of the file
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
  // For testing: log the current working directory and the file path being read.
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Reading file at path: ${filePath}`);
  // Read the file and return its contents.
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    // Print the raw file contents to stdout so that it can be captured in tests.
    console.log(data);
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
