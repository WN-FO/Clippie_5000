import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";
import ClientAuthProvider from "@/components/client-auth-provider";
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
  console.log('RootLayout rendering');
  
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
      <body className={`${inter.className} bg-white min-h-screen`}>
        <ClientAuthProvider>
          <AppProvider>
            <main className="min-h-screen bg-white">
              {children}
            </main>
            <Toaster />
            <ModalProvider />
          </AppProvider>
        </ClientAuthProvider>
        
        {/* Debug overlay */}
        <div id="debug-overlay" style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          zIndex: 9999,
          display: 'none'
        }}>
          App is loading...
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('Page loaded');
            document.getElementById('debug-overlay').style.display = 'block';
            setTimeout(() => {
              document.getElementById('debug-overlay').textContent = 'App loaded';
            }, 1000);
          `
        }} />
      </body>
    </html>
  );
}
