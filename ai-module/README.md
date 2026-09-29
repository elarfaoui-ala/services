# AI Module

Reusable AI integration built with **NestJS** (backend) and **Next.js** (frontend).
Powered by the Claude API with real-time streaming.

## Features

- Streaming chat with conversation history
- Stop generation mid-stream
- Token usage tracking per message and total session
- Document summarizer with 4 modes: Brief, Detailed, Bullets, ELI5
- Word count and estimated read time
- Copy summary to clipboard
- Reusable hooks: `useAIChat()` and `useAISummarize()`
- Clean, accessible UI — ready to embed in any project

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | NestJS, Anthropic SDK, SSE streaming    |
| Frontend | Next.js 14, Tailwind CSS                |
| AI       | Claude claude-sonnet-4-6                        |

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm install && npm run start:dev

# Frontend
cd frontend
cp .env.local.example .env.local
npm install && npm run dev
```

Open:
- http://localhost:3000/chat — streaming chat interface
- http://localhost:3000/summarize — document summarizer

## API Endpoints

| Method | Path                  | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | /api/ai/chat/stream   | SSE streaming chat              |
| POST   | /api/ai/summarize     | Document summarization          |
| POST   | /api/ai/complete      | One-shot completion             |

## Hook Usage

### Chat

```tsx
const { messages, isStreaming, send, stop, clear, totalTokens } = useAIChat({
  systemPrompt: 'You are a helpful assistant specialized in cooking.',
  maxTokens:    1024,
});

// Send a message
await send('What is the best way to make pasta?');

// Stop streaming mid-response
stop();

// Clear conversation history
clear();
```

### Summarizer

```tsx
const { result, isLoading, error, summarize, reset } = useAISummarize();

await summarize(longText, 'bullets');

console.log(result.summary);    // bullet point summary
console.log(result.wordCount);  // original word count
console.log(result.readTime);   // estimated read time in minutes
console.log(result.tokens);     // Claude tokens used
```

## Integrating into an existing NestJS project

```typescript
// Import AiModule in AppModule
@Module({ imports: [AiModule] })
export class AppModule {}

// Inject AiService anywhere
@Injectable()
export class YourService {
  constructor(private ai: AiService) {}

  async generateDescription(product: string) {
    return this.ai.complete(
      `Write a 2-sentence product description for: ${product}`,
      'You are a marketing copywriter.',
    );
  }
}
```

## Connecting the frontend to an existing project

```tsx
// Just copy lib/ and components/ into your Next.js project

// Wrap layout or specific page
<ChatInterface
  title="Support Assistant"
  systemPrompt="You are a customer support agent for Acme Corp."
/>

// Or use the hooks directly for custom UI
const { send, messages, isStreaming } = useAIChat({
  systemPrompt: 'You are a restaurant menu assistant.',
});
```

## Environment Variables

```env
# Backend
ANTHROPIC_API_KEY=sk-ant-...
PORT=4003
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_AI_API_URL=http://localhost:4003/api
```
