// app/layout.tsx

import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from 'next/font/google';
import "../styles/globals.css";
import ClientWrapper from "../components/ClientWrapper"; // New client wrapper

// Import Roboto for sans-serif
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-roboto',
});

// Import Roboto Mono for monospace
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: "Student Grouping App",
  description: "A tool for teachers to manage classes and group students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${robotoMono.variable}`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}