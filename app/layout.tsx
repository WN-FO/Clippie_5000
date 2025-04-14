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
export const revalidate = 0;

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
      <body className={inter.className}>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Root level error:', error, errorInfo);
          }}
        >
          <ClientAuthProvider>
            <div id="app-root">
              <main id="main-content" className="min-h-screen bg-white">
                <Suspense fallback={<LoadingFallback />}>
                  <AppProvider>
                    {children}
                  </AppProvider>
                  <Toaster richColors position="bottom-right" />
                  <ModalProvider />
                </Suspense>
              </main>
            </div>
            <WhiteScreenDetector />
            <DebuggerTool />
          </ClientAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
