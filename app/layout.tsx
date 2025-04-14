import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";
import ClientAuthProvider from "@/components/client-auth-provider";
import WhiteScreenDetector from "@/components/white-screen-detector";
import DebuggerTool from "@/components/debugger-tool";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorDisplay } from "@/components/ui/error-display";
import { AppProvider } from '@/components/app-provider';

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata({
  title: "Clippie 5000 - AI-Powered Video Clip Generator"
});

// Force dynamic rendering to prevent hydration issues
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Clippie 5000 - AI-Powered Video Clip Generator</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent white flash
              document.documentElement.style.backgroundColor = '#FFFFFF';
              document.body.style.backgroundColor = '#FFFFFF';
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-white`}>
        <WhiteScreenDetector />
        <DebuggerTool />
        <div id="app-root" className="min-h-screen relative z-0">
          <ErrorBoundary
            onError={(error, errorInfo) => {
              // Log root level errors to console
              console.error('Root level error:', error, errorInfo);
            }}
          >
            <ClientAuthProvider>
              <Suspense fallback={<LoadingFallback />}>
                <main id="main-content" role="main" aria-label="Main content" className="relative min-h-screen bg-white z-10">
                  <AppProvider>
                    {children}
                  </AppProvider>
                </main>
                <div className="z-50">
                  <Toaster richColors position="bottom-right" />
                  <ModalProvider />
                </div>
              </Suspense>
            </ClientAuthProvider>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
