'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend:      (message: string) => void;
  onStop:      () => void;
  isStreaming: boolean;
  disabled?:   boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value,  setValue]  = useState('');
  const textareaRef         = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) textareaRef.current.focus();
  }, [isStreaming]);

  function handleSend() {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={isStreaming || disabled}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={1}
        aria-label="Chat message input"
        className="flex-1 resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none bg-transparent px-2 py-1.5 max-h-40"
      />
      {isStreaming ? (
        <button
          onClick={onStop}
          aria-label="Stop generating response"
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                     bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
        >
          ■
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                     bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                     text-white rounded-xl transition-colors"
        >
          ↑
        </button>
      )}
    </div>
  );
}
