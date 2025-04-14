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
      <body className={inter.className}>
        <WhiteScreenFix />
        <ClientAuthProvider>
          <GlobalErrorHandler>
            <Toaster richColors/>
            <ModalProvider />
            {children}
          </GlobalErrorHandler>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
