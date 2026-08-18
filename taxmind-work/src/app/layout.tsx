import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import GoogleOAuthProvider from "@/components/providers/GoogleOAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0fdf4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1f16" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "TaxMind Pakistan — AI-Powered Tax Optimization",
    template: "%s | TaxMind Pakistan",
  },
  description:
    "Smart tax optimization platform for Pakistan's FBR tax system. Calculate taxes, scan documents with AI, and maximize deductions under ITO 2001 for Tax Year 2024-2025.",
  keywords: [
    "Pakistan tax",
    "FBR",
    "ITO 2001",
    "tax calculator",
    "tax optimization",
    "salary tax Pakistan",
    "business tax Pakistan",
    "AI tax assistant",
    "tax year 2024-2025",
    "FBR tax return",
    "Pakistan income tax",
  ],
  authors: [{ name: "TaxMind Pakistan", url: "https://taxmind.pk" }],
  creator: "TaxMind Pakistan",
  publisher: "TaxMind Pakistan",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  metadataBase: new URL("https://taxmind.pk"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TaxMind Pakistan — AI-Powered Tax Optimization",
    description:
      "Smart tax optimization platform for Pakistan's FBR tax system. Calculate taxes, scan documents with AI, and maximize deductions.",
    siteName: "TaxMind Pakistan",
    type: "website",
    locale: "en_PK",
    url: "https://taxmind.pk",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxMind Pakistan — AI-Powered Tax Optimization",
    description:
      "Smart tax optimization for Pakistan's FBR tax system. AI-powered calculations, document scanning & deduction maximization.",
    creator: "@taxmindpk",
    images: ["/og-image.png"],
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
