'use client';

import { useEffect }  from 'react';
import { useRouter }  from 'next/navigation';
import { useAuth }    from '../../lib/auth-context';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back, {user.name}
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 mb-1">Role</p>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium
                ${user.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'}`}>
                {user.role}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 col-span-2">
              <p className="text-gray-500 mb-1">User ID</p>
              <p className="font-mono text-xs text-gray-700">{user.id}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 pt-2">
            Auth module — JWT access token (15m) + refresh token (7d) with rotation.
          </p>
        </div>
      </div>
    </main>
  );
}
