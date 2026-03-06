import readTool, {type ToolResponse} from './readTool';
import writeTool from './writeTool';

type ToolFunction = {
  name?: string;
  arguments?: string;
};

type ToolCall = {
  id: string;
  type: string;
  function?: ToolFunction;
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
export default function parseToolCall(toolCall: ToolCall): ToolResponse {
  if (!toolCall.function) {
    return {
      role: 'tool',
      tool_call_id: toolCall.id,
      content: 'No function specified in tool call',
    };
  }
  switch (toolCall.function.name) {
    case 'Read':
      const args = argumentsParser(toolCall.function);
      if (!args.file_path) {
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content:
            'The "Read" function requires a "file_path" argument, but it was not provided',
        };
      }
      // Call the readTool
      return readTool(args.file_path, toolCall.id);
    case 'Write':
      const writeArgs = argumentsParser(toolCall.function);
      if (!writeArgs.file_path || !writeArgs.content) {
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content:
            'The "Write" function requires "file_path" and "content" arguments, but they were not provided',
        };
      }
      // Call the writeTool
      return writeTool(writeArgs.file_path, writeArgs.content, toolCall.id);
    default:
      return {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: `The tool function "${toolCall.function.name}" is not supported`,
      };
  }
}
