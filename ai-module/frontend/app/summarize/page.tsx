'use client';

import Link                   from 'next/link';
import { DocumentSummarizer } from '../../components/summarizer/document-summarizer';
import { ErrorBoundary }      from '../../components/error-boundary';
import { ThemeToggle }        from '../../components/theme-toggle';

export default function SummarizePage() {
  return (
    <main className="min-h-screen">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center gap-4">
        <h1 className="text-sm font-bold">AI Module</h1>
        <div className="flex gap-3 text-xs">
          <Link href="/chat"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Chat
          </Link>
          <Link href="/summarize"
                className="text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-0.5">
            Summarizer
          </Link>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Document Summarizer</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Paste any text — article, report, email, code comments — and get an instant AI summary.
          </p>
        </div>
        <ErrorBoundary>
          <DocumentSummarizer />
        </ErrorBoundary>
      </div>
    </main>
  );
}
