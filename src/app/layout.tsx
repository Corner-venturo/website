import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import DesktopWrapper from "@/components/DesktopWrapper";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Venturo",
  description: "探索世界，結交旅伴",
  openGraph: {
    title: "Venturo",
    description: "探索世界，結交旅伴",
    siteName: "Venturo",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Venturo",
    description: "探索世界，結交旅伴",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined|Material+Icons+Round"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <DesktopWrapper>{children}</DesktopWrapper>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
