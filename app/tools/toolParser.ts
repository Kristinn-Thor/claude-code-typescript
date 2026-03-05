import readTool from './readTool';

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
    throw new Error('Tool function is not defined');
  }
  if (!func.arguments) {
    throw new Error('Tool function arguments are not defined');
  }
  let args;
  try {
    args = JSON.parse(func.arguments);
  } catch (err) {
    throw new Error(
      `Error parsing tool function arguments: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
  return args;
};

/**
 * Parses the tool call from the response and applies the corresponding function.
 * Currently supports the "Read" function which reads the contents of a file.
 * @param toolCall Tool call response from the OpenAI API
 * @returns void
 */
export default function parseToolCall(toolCall: ToolCall): void {
  if (!toolCall.function) {
    throw new Error('Tool function is not defined');
  }
  switch (toolCall.function.name) {
    case 'Read':
      const args = argumentsParser(toolCall.function);
      if (!args.file_path) {
        throw new Error('file_path argument is required for Read function');
      }
      // Call the readTool
      readTool(args.file_path);
      break;

    default:
      throw new Error(`Unsupported tool function: ${toolCall.function.name}`);
  }
}
