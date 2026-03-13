import path from 'path';
import {fileURLToPath} from 'url';
import exec from 'child_process';
import type {ToolResponse} from './toolParser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, '../../');

/**
 * Validates if a shell command is allowed for file/directory creation or file deletion within the project directory.
 * Allowed commands: touch <file>, mkdir <dir>, rm <file>, ls <dir>
 * Restrictions:
 * - The target file/directory must be within the project directory.
 * @param command The shell command to validate
 * @returns true if allowed, false otherwise
 */
export function isAllowedCommand(command: string): boolean {
  // Only allow touch, mkdir, rm, ls commands (with or without arguments)
  const touchMatch = command.match(/^touch(?:\s+(.*))?$/);
  const mkdirMatch = command.match(/^mkdir(?:\s+(.*))?$/);
  const rmMatch = command.match(/^rm(?:\s+(.*))?$/);
  const lsMatch = command.match(/^ls(?:\s+(.*))?$/);

  let arg: string | undefined;
  if (touchMatch) arg = touchMatch[1];
  else if (mkdirMatch) arg = mkdirMatch[1];
  else if (rmMatch) arg = rmMatch[1];
  else if (lsMatch) arg = lsMatch[1];
  else return false;

  const targetPath = arg || '';
  // If no argument is provided (e.g., 'ls'), allow
  if (targetPath === '') {
    // Only allow for ls, not for touch/mkdir/rm
    return !!lsMatch;
  }

  // Resolve absolute path
  const absTargetPath = path.resolve(PROJECT_DIR, targetPath);
  // Ensure path is within project directory
  if (!absTargetPath.startsWith(PROJECT_DIR)) return false;
  // For rm, allow deletion of files and directories as long as path is within project directory
  if (rmMatch) {
    return true;
  }
  return true;
}

/**
 * Executes a shell command.
 * @param command The command to execute
 * @returns ToolResponse
 */
export default function bashTool(
  command: string,
  toolCallId: string,
): Promise<ToolResponse> {
  if (!isAllowedCommand(command)) {
    return Promise.resolve({
      role: 'tool',
      tool_call_id: toolCallId,
      content: 'Error: Access to the specified command is not allowed',
    });
  }
  return new Promise((resolve) => {
    try {
      exec.exec(command, (error, stdout) => {
        if (error) {
          resolve({
            role: 'tool',
            tool_call_id: toolCallId,
            content: `Error executing command: ${error.message}`,
          });
        } else {
          resolve({
            role: 'tool',
            tool_call_id: toolCallId,
            content: stdout,
          });
        }
      });
    } catch (err) {
      console.error('Error executing command:', err);
      resolve({
        role: 'tool',
        tool_call_id: toolCallId,
        content: `Error executing command`,
      });
    }
  });
}

export const BashTool = {
  type: 'function',
  function: {
    name: 'Bash',
    description: 'Execute a shell command',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The command to execute',
        },
      },
      required: ['command'],
    },
  },
} as const;
