import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";
import ClientAuthProvider from "@/components/client-auth-provider";
import { GlobalErrorHandler } from "@/components/global-error-handler";
import WhiteScreenFix from "@/components/white-screen-fix";

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
        <script dangerouslySetInnerHTML={{
          __html: `
            // Prevent flash of unstyled content
            document.documentElement.classList.add('js');
            // Initialize state before hydration
            window.__INITIAL_STATE__ = {
              hydrated: false,
              auth: null
            };
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <WhiteScreenFix />
        <div id="app-root" className="min-h-screen relative">
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
