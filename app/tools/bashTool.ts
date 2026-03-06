import fs from 'fs';
import path from 'path';
import exec from 'child_process';
import type {ToolResponse} from './toolParser';

const PROJECT_DIR = path.resolve(__dirname, '../../');

/**
 * Validates if a shell command is allowed for file/directory creation or file deletion within the project directory.
 * Allowed commands: touch <file>, mkdir <dir>, rm <file>
 * @param command The shell command to validate
 * @returns true if allowed, false otherwise
 */
export function isAllowedCommand(command: string): boolean {
  // Only allow touch, mkdir, rm commands
  const touchMatch = command.match(/^touch\s+(.+)$/);
  const mkdirMatch = command.match(/^mkdir\s+(.+)$/);
  const rmMatch = command.match(/^rm\s+(.+)$/);

  let targetPath = '';
  if (touchMatch) targetPath = touchMatch[1];
  else if (mkdirMatch) targetPath = mkdirMatch[1];
  else if (rmMatch) targetPath = rmMatch[1];
  else return false;

  // Resolve absolute path
  const absTargetPath = path.resolve(PROJECT_DIR, targetPath);
  // Ensure path is within project directory
  if (!absTargetPath.startsWith(PROJECT_DIR)) return false;
  // For rm, ensure it's not a directory
  if (rmMatch) {
    try {
      const stat = fs.statSync(absTargetPath);
      if (stat.isDirectory()) return false;
    } catch (e) {
      // If file doesn't exist, allow (rm will error out)
    }
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
): ToolResponse {
  if (!isAllowedCommand(command)) {
    return {
      role: 'tool',
      tool_call_id: toolCallId,
      content: 'Error: Access to the specified command is not allowed',
    };
  }
  // Execute the command
  let result: ToolResponse = {
    role: 'tool',
    tool_call_id: toolCallId,
    content: '',
  };
  try {
    exec.exec(command, {cwd: PROJECT_DIR}, (error, stout) => {
      if (error) {
        result = {
          role: 'tool',
          tool_call_id: toolCallId,
          content: `Error executing command: ${error.message}`,
        };
      }
      result = {
        role: 'tool',
        tool_call_id: toolCallId,
        content: stout,
      };
    });
  } catch (err) {
    result = {
      role: 'tool',
      tool_call_id: toolCallId,
      content: `Error executing command}`,
    };
  }
  return result;
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
