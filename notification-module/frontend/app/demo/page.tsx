'use client';

import { useNotifications } from '../../lib/use-notifications';

export default function DemoPage() {
  const { emit, add, dismissAll, connected, notifications } = useNotifications();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Notification Module</h1>
          <p className="text-sm text-gray-500 mt-1">
            WebSocket status:{' '}
            <span className={`font-medium ${connected ? 'text-green-600' : 'text-red-500'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </p>
        </div>

        {/* Local notifications (current tab only) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Local (this tab only)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => add({ type: 'success', title: 'Success!', message: 'Operation completed.' })}
              className="py-2 px-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Success
            </button>
            <button
              onClick={() => add({ type: 'error', title: 'Error!', message: 'Something went wrong.', duration: 0 })}
              className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Error (persistent)
            </button>
            <button
              onClick={() => add({ type: 'warning', title: 'Warning', message: 'Low disk space.' })}
              className="py-2 px-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Warning
            </button>
            <button
              onClick={() => add({ type: 'info', title: 'Info', message: 'New update available.' })}
              className="py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Info
            </button>
          </div>
        </div>

        {/* Broadcast via WebSocket (all connected clients receive it) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            Broadcast via WebSocket (all tabs)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => emit({ type: 'success', title: 'Broadcast!', message: 'Sent to all clients.' })}
              disabled={!connected}
              className="py-2 px-3 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Broadcast success
            </button>
            <button
              onClick={() => emit({ type: 'error', title: 'System error', message: 'Critical issue detected.', duration: 0 })}
              disabled={!connected}
              className="py-2 px-3 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Broadcast error
            </button>
          </div>
          {!connected && (
            <p className="text-xs text-red-500">Start the backend to enable WebSocket broadcasts.</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={dismissAll}
            disabled={notifications.length === 0}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Dismiss all ({notifications.length})
          </button>
        </div>

        {/* Usage code snippet */}
        <div className="bg-gray-900 rounded-xl p-4 text-xs text-gray-300 font-mono leading-relaxed">
          <p className="text-gray-500 mb-2">// Usage in any component:</p>
          <p><span className="text-blue-400">const</span> {'{ add, emit } = '}<span className="text-yellow-400">useNotifications</span>()</p>
          <p className="mt-1"><span className="text-blue-400">add</span>{'({ type: "success", title: "Done!" })'}</p>
          <p><span className="text-blue-400">emit</span>{'({ type: "info", title: "For all!" })'}</p>
        </div>
      </div>
    </main>
  );
}
