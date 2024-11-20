// app/layout.tsx
import type { Metadata } from "next";
import localFont from 'next/font/local'; // Import localFont
import "../styles/globals.css";
import ClientWrapper from "../components/ClientWrapper";

// Import Geist as a local font
const geist = localFont({
  src: [
    {
      path: '../public/fonts/Geist/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Geist/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    // Add other weights/styles as needed
  ],
  variable: '--font-geist', // Define the CSS variable
  display: 'swap', // Optional: Defines how the font is displayed
});

// Import Geist Mono as a local font
const geistMono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMono/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GeistMono/GeistMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    // Add other weights/styles as needed
  ],
  variable: '--font-geist-mono', // Define the CSS variable
  display: 'swap', // Optional: Defines how the font is displayed
});

export const metadata: Metadata = {
  title: "Student Grouping App",
  description: "A tool for teachers to manage classes and group students",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#ffffff",
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}