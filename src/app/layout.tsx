import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AuthProvider } from '@/components/AuthProvider';
import ClientBody from '@/components/ClientBody';

export const metadata: Metadata = {
  title: "ChatApp",
  description: "Real-time chat application",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <ClientBody>
            {children}
          </ClientBody>
        </AuthProvider>
      </body>
    </html>
  );
}