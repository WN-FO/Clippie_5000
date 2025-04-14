import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";
import ClientAuthProvider from "@/components/client-auth-provider";
import { GlobalErrorHandler } from "@/components/global-error-handler";
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
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-white`}>
        <WhiteScreenDetector />
        <DebuggerTool />
        <div id="app-root" className="min-h-screen relative z-0">
          <ClientAuthProvider>
            <GlobalErrorHandler>
              <main id="main-content" role="main" aria-label="Main content" className="relative min-h-screen bg-white z-10">
                {children}
              </main>
              <div className="z-50">
                <Toaster richColors position="bottom-right" />
                <ModalProvider />
              </div>
            </GlobalErrorHandler>
          </ClientAuthProvider>
        </div>
      </body>
    </html>
  );
}
