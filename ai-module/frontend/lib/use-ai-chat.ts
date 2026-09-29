'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage }                    from './ai.types';
import { authorizedFetch }                 from './auth';

const API = process.env.NEXT_PUBLIC_AI_API_URL ?? 'http://localhost:4003/api';

interface UseAIChatOptions {
  systemPrompt?: string;
  maxTokens?:    number;
  onError?:      (err: string) => void;
}

interface UseAIChatReturn {
  messages:    ChatMessage[];
  isStreaming: boolean;
  error:       string | null;
  totalTokens: number;
  send:        (content: string) => Promise<void>;
  clear:       () => void;
  stop:        () => void;
}

function makeId() { return crypto.randomUUID(); }

export function useAIChat(opts: UseAIChatOptions = {}): UseAIChatReturn {
  const { systemPrompt, maxTokens, onError } = opts;

  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const abortRef    = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: makeId(), role: 'user', content: content.trim(), createdAt: Date.now(),
    };

    const assistantId = makeId();
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() },
    ]);
    setIsStreaming(true);
    setError(null);

    const controller  = new AbortController();
    abortRef.current  = controller;

    try {
      const history = [...messagesRef.current, userMsg].map(m => ({
        role:    m.role,
        content: m.content,
      }));

      const res = await authorizedFetch(`${API}/ai/chat/stream`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history, systemPrompt, maxTokens }),
        signal:  controller.signal,
      });

      if (res.status === 401) throw new Error('Session expired — please sign in again');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const chunk = JSON.parse(line.slice(6));

            if (chunk.type === 'delta' && chunk.content) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk.content }
                  : m,
              ));
            }

            if (chunk.type === 'done') {
              const tokenCount = chunk.tokens ?? 0;
              setTotalTokens(t => t + tokenCount);
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, tokens: tokenCount } : m,
              ));
            }

            if (chunk.type === 'error') {
              throw new Error(chunk.error ?? 'Stream error');
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      const msg = err.message ?? 'Something went wrong';
      setError(msg);
      onError?.(msg);
      setMessages(prev => prev.filter(m => m.id !== assistantId || m.content));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, systemPrompt, maxTokens, onError]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    setTotalTokens(0);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, error, totalTokens, send, clear, stop };
}
