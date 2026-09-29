import type { Metadata }            from 'next';
import { Inter }                     from 'next/font/google';
import { NotificationsProvider }     from '../lib/use-notifications';
import { NotificationToasts }        from '../components/notifications/notification-toasts';
import { ErrorBoundary }             from '../components/error-boundary';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       'Notification Module',
  description: 'Real-time WebSocket notifications — NestJS + Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <ErrorBoundary>
          <NotificationsProvider>
            {children}
            <NotificationToasts />
          </NotificationsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
