import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { AuthProvider } from "@/hooks/use-auth";

import { Toaster } from 'sonner'
import { ModalProvider } from "@/components/modal-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Toaster richColors/>
          <ModalProvider />

          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
