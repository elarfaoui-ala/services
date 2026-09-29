export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id:        string;
  role:      MessageRole;
  content:   string;
  createdAt: number;
  tokens?:   number;
}

export type SummarizeMode = 'brief' | 'detailed' | 'bullets' | 'eli5';

export interface SummarizeResponse {
  summary:   string;
  wordCount: number;
  readTime:  number;
  tokens:    number;
}
