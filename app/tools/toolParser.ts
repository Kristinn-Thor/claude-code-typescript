import readTool, {type ToolResponse} from './readTool';

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
  if (!func) {
    return {};
  }
  if (!func.arguments) {
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
 * Currently supports the "Read" function which reads the contents of a file.
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
    default:
      return {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: `The tool function "${toolCall.function.name}" is not supported`,
      };
  }
}
