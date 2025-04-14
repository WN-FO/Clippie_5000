import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";
import ClientAuthProvider from "@/components/client-auth-provider";
import { GlobalErrorHandler } from "@/components/global-error-handler";
import WhiteScreenFix from "@/components/white-screen-fix";
import WhiteScreenDetector from "@/components/white-screen-detector";
import DebuggerTool from "@/components/debugger-tool";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata({
  title: "Clippie 5000 - AI-Powered Video Clip Generator"
});

// Force dynamic rendering to prevent hydration issues
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              overflow-x: hidden;
            }
            #app-root, #main-content {
              visibility: visible !important;
              display: block !important;
              min-height: 100vh;
              position: relative;
              z-index: 1;
            }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`} style={{
        display: 'block',
        minHeight: '100vh',
        background: '#FFFFFF',
        visibility: 'visible',
        position: 'relative'
      }}>
        <WhiteScreenFix />
        <WhiteScreenDetector />
        <DebuggerTool />
        <div id="app-root" className="min-h-screen relative" style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          zIndex: 10,
          background: '#FFFFFF'
        }}>
          <ClientAuthProvider>
            <GlobalErrorHandler>
              <Toaster richColors position="bottom-right" />
              <ModalProvider />
              <main id="main-content" role="main" aria-label="Main content" className="relative z-10 min-h-screen bg-white">
                {children}
              </main>
            </GlobalErrorHandler>
          </ClientAuthProvider>
        </div>
      </body>
    </html>
  );
}
