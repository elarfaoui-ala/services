'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center h-full p-8" role="alert">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md text-center">
            <div className="text-3xl mb-3">⚠</div>
            <h2 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Something went wrong
            </h2>
            <p className="text-xs text-red-600 dark:text-red-300">
              {this.state.error?.message ?? 'Unexpected error'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 text-xs font-medium text-red-700 dark:text-red-200 underline hover:no-underline"
              aria-label="Try again"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
