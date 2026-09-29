'use client';

import { useRouter } from 'next/navigation';
import Link          from 'next/link';
import { useAuth }   from '../../lib/auth-context';
import { useAuthForm } from '../../lib/use-auth-form';

export default function LoginPage() {
  const { login }  = useAuth();
  const router     = useRouter();

  const { values, error, loading, handleChange, handleSubmit } = useAuthForm({
    initialValues: { email: '', password: '' },
    onSubmit: async ({ email, password }) => {
      await login(email, password);
      router.push('/dashboard');
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-8">
          No account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Create one</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              required value={values.email} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password" name="password" type="password" autoComplete="current-password"
              required value={values.password} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                       text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
