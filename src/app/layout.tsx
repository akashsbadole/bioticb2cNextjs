import type { Metadata, Viewport } from "next";
import { Poppins, Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeInjectorWrapper } from "@/components/store/ThemeInjectorWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFFFFF",
};

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Biotic Naturals";
const siteDesc =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Premium products and exceptional service.";

export const metadata: Metadata = {
  title: {
    default: `${siteName} - ${siteDesc}`,
    template: `%s | ${siteName}`,
  },
  description: siteDesc,
  keywords: [siteName],
  authors: [{ name: siteName }],
  creator: siteName,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} - ${siteDesc}`,
    description: siteDesc,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - ${siteDesc}`,
    description: siteDesc,
  },
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
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=yes" />
        <meta name="format-detection" content="email=yes" />
        <meta name="format-detection" content="address=yes" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google.com" />
        <link rel="dns-prefetch" href="//www.gstatic.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body
        className={`${poppins.variable} ${fraunces.variable} ${workSans.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
              <ThemeInjectorWrapper />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
