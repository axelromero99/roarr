import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Roarr - Find Your Pack",
    template: "%s | Roarr",
  },
  description: "Dating app for therians & furries. Find your soulmate in the wild. Connect with fellow furries, therians and otherkin.",
  keywords: ["furry", "therian", "otherkin", "dating", "fursona", "furry dating app"],
  openGraph: {
    title: "Roarr - Find Your Pack",
    description: "Dating app for therians & furries. Find your soulmate in the wild.",
    siteName: "Roarr",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roarr - Find Your Pack",
    description: "Dating app for therians & furries. Find your soulmate in the wild.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
