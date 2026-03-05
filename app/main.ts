import OpenAI from 'openai';

import toolParser from './tools/toolParser';
import {ReadTool} from './tools/readTool';
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionToolMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources';

async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';

  // Use a free model if running locally.
  const isLocal = process.env.LOCAL_MODEL === 'True';
  const model = isLocal
    ? 'z-ai/glm-4.5-air:free'
    : 'anthropic/claude-haiku-4.5';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }
  if (flag !== '-p' || !prompt) {
    throw new Error('error: -p flag is required');
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const messageHistory: (
    | ChatCompletionUserMessageParam
    | ChatCompletionAssistantMessageParam
    | ChatCompletionToolMessageParam
  )[] = [{role: 'user', content: prompt}];
  let finished = false;
  let content = '';

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error('Logs from your program will appear here!');

  while (!finished) {
    const response = await client.chat.completions.create({
      model: model,
      messages: messageHistory,
      tools: [ReadTool],
    });
    if (!response.choices || response.choices.length === 0) {
      throw new Error('no choices in response');
    }
    // Add the assistant's message to the message history.
    messageHistory.push(response.choices[0].message);
    const messageContent = response.choices[0].message.content;
    if (
      response.choices[0].message.tool_calls &&
      response.choices[0].message.tool_calls.length > 0
    ) {
      // If there are tool calls, parse and execute each tool call and add the tool response to the message history.
      response.choices[0].message.tool_calls.forEach((toolCall) => {
        if (toolCall) {
          const toolResponse = toolParser(toolCall);
          messageHistory.push(toolResponse);
        }
      });
    } else {
      content = messageContent || '';
      finished = true;
    }
  }
  console.log(content);
}

main();
