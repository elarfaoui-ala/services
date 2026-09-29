'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../lib/auth-api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified!');
        setTimeout(() => router.push('/login'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message ?? 'Verification failed.');
      });
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">&#10003;</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verified!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">Go to login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">&#10007;</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link href="/login" className="text-blue-600 hover:underline text-sm">Back to login</Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
