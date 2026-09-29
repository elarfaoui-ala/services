'use client';

import Link                    from 'next/link';
import { ChatInterface }       from '../../components/chat/chat-interface';
import { ErrorBoundary }       from '../../components/error-boundary';
import { ThemeToggle }         from '../../components/theme-toggle';

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center gap-4">
        <h1 className="text-sm font-bold">AI Module</h1>
        <div className="flex gap-3 text-xs">
          <Link href="/chat"
                className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-0.5">
            Chat
          </Link>
          <Link href="/summarize"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Summarizer
          </Link>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col min-h-0">
        <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 120px)' }}>
          <ErrorBoundary>
            <ChatInterface
              title="AI Chat"
              systemPrompt="You are a helpful, concise, and friendly assistant. Respond clearly and directly."
            />
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
}
