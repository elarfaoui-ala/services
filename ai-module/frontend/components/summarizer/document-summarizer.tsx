'use client';

import { useState }        from 'react';
import { useAISummarize }  from '../../lib/use-ai-summarize';
import { SummarizeMode }   from '../../lib/ai.types';

const MODES: { label: string; value: SummarizeMode; desc: string }[] = [
  { label: 'Brief',    value: 'brief',    desc: '2-3 sentence summary'     },
  { label: 'Detailed', value: 'detailed', desc: 'Comprehensive overview'    },
  { label: 'Bullets',  value: 'bullets',  desc: 'Key points as bullet list' },
  { label: 'ELI5',     value: 'eli5',     desc: 'Simple language, no jargon'},
];

export function DocumentSummarizer() {
  const [text, setText]   = useState('');
  const [mode, setMode]   = useState<SummarizeMode>('brief');
  const { result, isLoading, error, summarize, reset } = useAISummarize();

  function handleSubmit() {
    if (!text.trim() || isLoading) return;
    summarize(text, mode);
  }

  function handleClear() {
    setText('');
    reset();
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Summary mode">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            role="radio"
            aria-checked={mode === m.value}
            aria-label={m.desc}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
              ${mode === m.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); if (result) reset(); }}
          placeholder="Paste your text here — article, document, report, code comments…"
          rows={8}
          aria-label="Text to summarize"
          className="w-full text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                     rounded-2xl p-4 resize-none focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:border-transparent"
        />
        <span className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
          {wordCount.toLocaleString()} words
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          aria-label="Run summarization"
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                     text-white text-sm font-medium rounded-xl transition-colors"
        >
          {isLoading ? 'Summarizing…' : 'Summarize'}
        </button>
        {(text || result) && (
          <button
            onClick={handleClear}
            aria-label="Clear text and result"
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400
                       text-sm font-medium rounded-xl transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Summary</h3>
            <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span>{result.wordCount.toLocaleString()} words in</span>
              <span>{result.readTime} min read</span>
              <span>{result.tokens} tokens used</span>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {result.summary}
          </p>

          <button
            onClick={() => navigator.clipboard.writeText(result.summary)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            aria-label="Copy summary to clipboard"
          >
            Copy to clipboard
          </button>
        </div>
      )}

      {isLoading && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 space-y-3 animate-pulse" aria-label="Loading summary">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-24" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-4/6" />
          </div>
        </div>
      )}
    </div>
  );
}
