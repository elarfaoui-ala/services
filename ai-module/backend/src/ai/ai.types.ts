export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id:        string;
  role:      MessageRole;
  content:   string;
  createdAt: number;
  tokens?:   number;
}

export interface ChatRequest {
  messages:      { role: MessageRole; content: string }[];
  systemPrompt?: string;
  maxTokens?:    number;
  model?:        string;
}

export interface SummarizeRequest {
  text:      string;
  mode?:     SummarizeMode;
  language?: string;
}

export type SummarizeMode = 'brief' | 'detailed' | 'bullets' | 'eli5';

export interface SummarizeResponse {
  summary:   string;
  wordCount: number;
  readTime:  number;
  tokens:    number;
}

export interface StreamChunk {
  type:     'delta' | 'done' | 'error';
  content?: string;
  error?:   string;
  tokens?:  number;
  usage?:   AIUsage;
}

export interface AIUsage {
  inputTokens:  number;
  outputTokens: number;
  totalTokens:  number;
}
