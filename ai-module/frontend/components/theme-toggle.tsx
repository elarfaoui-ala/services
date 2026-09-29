'use client';

import { useTheme } from '../lib/use-theme';

export function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded-lg
                 text-gray-500 dark:text-gray-400
                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
