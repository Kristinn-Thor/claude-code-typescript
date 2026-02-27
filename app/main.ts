import OpenAI from 'openai';

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

  const readTool = {
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

  const response = await client.chat.completions.create({
    model: model,
    messages: [{role: 'user', content: prompt}],
    tools: [readTool],
  });

  if (!response.choices || response.choices.length === 0) {
    throw new Error('no choices in response');
  }

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error('Logs from your program will appear here!');

  // TODO: Uncomment the lines below to pass the first stage
  console.log(response.choices[0].message.content);
}

main();
