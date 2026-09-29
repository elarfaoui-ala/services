'use client';

import { ChatMessage } from '../../lib/ai.types';

interface MessageBubbleProps {
  message:     ChatMessage;
  isStreaming: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isEmpty = !message.content && isStreaming;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                        flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1"
             aria-hidden="true">
          AI
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-200 rounded-bl-md'}`}
        role="status"
        aria-label={`${isUser ? 'Your' : 'AI'} message${isStreaming ? ', generating…' : ''}`}>

        {isEmpty ? (
          <span className="flex gap-1 items-center h-4" aria-label="AI is thinking" role="status">
            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {message.tokens && (
          <p className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
            {message.tokens} tokens
          </p>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center
                        text-gray-600 dark:text-gray-300 text-xs font-bold flex-shrink-0 mt-1"
             aria-hidden="true">
          You
        </div>
      )}
    </div>
  );
}
