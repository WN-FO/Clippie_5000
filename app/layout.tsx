import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";
import ClientAuthProvider from "@/components/client-auth-provider";
import { GlobalErrorHandler } from "@/components/global-error-handler";
import WhiteScreenFix from "@/components/white-screen-fix";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <WhiteScreenFix />
        <div id="app-root" className="min-h-screen">
          <ClientAuthProvider>
            <GlobalErrorHandler>
              <Toaster richColors/>
              <ModalProvider />
              <main>
                {children}
              </main>
            </GlobalErrorHandler>
          </ClientAuthProvider>
        </div>
      </body>
    </html>
  );
}
