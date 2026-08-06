import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaxMind Pakistan - AI Tax Optimization Platform",
  description: "FBR-compliant tax calculation, legal optimization, and professional tax management for Pakistan. AI-powered document analysis with secure authentication.",
  keywords: ["Pakistan Tax", "FBR", "Tax Calculator", "Tax Optimization", "Income Tax Pakistan", "NTN", "IRIS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
      >
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
