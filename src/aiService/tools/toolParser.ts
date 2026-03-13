import bashTool from './bashTool.js';
import readTool from './readTool.js';
import writeTool from './writeTool.js';

type ToolFunction = {
  name?: string;
  arguments?: string;
};

type ToolCall = {
  id: string;
  type: string;
  function?: ToolFunction;
};

export type ToolResponse = {
  role: 'tool';
  tool_call_id: string;
  content: string;
};

const argumentsParser = (func?: ToolFunction) => {
  if (!func || !func.arguments) {
    return {};
  }
  let args;
  try {
    args = JSON.parse(func.arguments);
  } catch (err) {
    return {};
  }
  return args;
};

/**
 * Parses the tool call from the response and applies the corresponding function.
 * Currently supports: "Read" function which reads the contents of a file, and "Write" function which writes content to a file.
 * @param toolCall Tool call response from the OpenAI API
 * @returns ToolResponse
 */
export default async function parseToolCall(
  toolCall: ToolCall,
): Promise<ToolResponse> {
  if (!toolCall.function) {
    return Promise.resolve({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: 'No function specified in tool call',
    });
  }
  switch (toolCall.function.name) {
    case 'Read': {
      const args = argumentsParser(toolCall.function);
      if (!args.file_path) {
        return Promise.resolve({
          role: 'tool',
          tool_call_id: toolCall.id,
          content:
            'The "Read" function requires a "file_path" argument, but it was not provided',
        });
      }
      // Call the readTool
      return Promise.resolve(readTool(args.file_path, toolCall.id));
    }
    case 'Write': {
      const writeArgs = argumentsParser(toolCall.function);
      if (!writeArgs.file_path) {
        return Promise.resolve({
          role: 'tool',
          tool_call_id: toolCall.id,
          content:
            'The "Write" function requires a "file_path" argument, but it was not provided',
        });
      }
      if (writeArgs.content === undefined) {
        return Promise.resolve({
          role: 'tool',
          tool_call_id: toolCall.id,
          content:
            'The "Write" function was called but no "content" argument was provided.',
        });
      }
      // Call the writeTool
      return Promise.resolve(
        writeTool(writeArgs.file_path, writeArgs.content, toolCall.id),
      );
    }
    case 'Bash': {
      const bashArgs = argumentsParser(toolCall.function);
      if (!bashArgs.command) {
        return Promise.resolve({
          role: 'tool',
          tool_call_id: toolCall.id,
          content:
            'The "Bash" function requires a "command" argument, but it was not provided',
        });
      }
      // Call the bashTool (returns a Promise)
      return await bashTool(bashArgs.command, toolCall.id);
    }
    default:
      return Promise.resolve({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: `The tool function "${toolCall.function.name}" is not supported`,
      });
  }
}
