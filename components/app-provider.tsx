'use client';

import { useErrorMonitoring } from '@/lib/client-error-monitoring';
import { useAsyncErrorHandler } from '@/components/error-boundary';
import { Toaster } from 'sonner';
import { ModalProvider } from '@/components/modal-provider';
import ClientAuthProvider from '@/components/client-auth-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorDisplay } from '@/components/ui/error-display';
import WhiteScreenDetector from '@/components/white-screen-detector';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Set up global error monitoring
  useErrorMonitoring();
  
  // Set up async error handling
  useAsyncErrorHandler();
  
  return (
    <ErrorBoundary>
      <ClientAuthProvider>
        <div id="app-root">
          <div id="main-content">
            {children}
          </div>
          <Toaster richColors position="bottom-right" />
          <ModalProvider />
          <WhiteScreenDetector />
        </div>
      </ClientAuthProvider>
    </ErrorBoundary>
  );
} 