import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import GoogleOAuthProvider from "@/components/providers/GoogleOAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaxMind Pakistan — AI-Powered Tax Optimization",
  description: "Smart tax optimization platform for Pakistan's FBR tax system. Calculate taxes, scan documents with AI, and maximize deductions under ITO 2001 for Tax Year 2024-2025.",
  keywords: ["Pakistan tax", "FBR", "ITO 2001", "tax calculator", "tax optimization", "salary tax Pakistan", "business tax Pakistan"],
  authors: [{ name: "TaxMind Pakistan" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <GoogleOAuthProvider>
          {children}
          <Toaster />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
