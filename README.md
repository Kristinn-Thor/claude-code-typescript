# Claude Code assistant replica

This project is based on the CodeCrafters "Build your own Claude Code challenge"

Claude Code is an AI coding assistant that uses Large Language Models (LLMs) to
understand code and perform actions through tool calls.

## Setup: Environment Variables

Before running the project, create a `.env` file in the project root with the following variables:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here   # (Required) Your OpenRouter API key
OPENROUTER_MODEL=z-ai/glm-4.5-air:free            # (Optional) Specify the model to use (default: 'anthropic/claude-haiku-4.5')
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1  # (Optional) Override the default API URL
```

**Notes:**

- `OPENROUTER_API_KEY` is required.
- `OPENROUTER_MODEL` lets you choose which model to use. If not set, defaults to 'anthropic/claude-haiku-4.5'.
- `OPENROUTER_BASE_URL` is optional and overrides the API endpoint if needed.

## To run

1. Ensure you have `bun (1.3)` installed locally.
2. Run `./run_program.sh` to run your program, which is implemented in `app/main.ts`.

   Example: `./run_program.sh -p "What can you tell me about this project?"`
