'use client';

import { useEffect, useRef } from 'react';
import { useAIChat }         from '../../lib/use-ai-chat';
import { MessageBubble }     from './message-bubble';
import { ChatInput }         from './chat-input';

interface ChatInterfaceProps {
  systemPrompt?: string;
  placeholder?:  string;
  title?:        string;
}

export function ChatInterface({
  systemPrompt = 'You are a helpful, concise assistant.',
  title        = 'AI Assistant',
}: ChatInterfaceProps) {
  const { messages, isStreaming, error, totalTokens, send, clear, stop } = useAIChat({
    systemPrompt,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

      <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {totalTokens > 0 && (
            <span className="text-xs text-gray-400">{totalTokens.toLocaleString()} tokens</span>
          )}
          {!isEmpty && (
            <button
              onClick={clear}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear conversation"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0" role="log" aria-label="Chat messages" aria-live="polite">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600
                            flex items-center justify-center text-white text-xl" aria-hidden="true">
              ✦
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">How can I help you today?</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Powered by Claude — streaming responses</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
            />
          ))
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-3 py-2 rounded-xl" role="alert">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <ChatInput
          onSend={send}
          onStop={stop}
          isStreaming={isStreaming}
        />
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
