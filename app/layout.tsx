import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";

const geistSans = Vazirmatn({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Don's Docs - Aiken Library Documentation Browser",
    template: "%s | Don's Docs",
  },
  description:
    "Interactive documentation browser for Aiken libraries including stdlib, prelude, and vodka packages. Search and browse functions, types, constants, and modules.",
  keywords: [
    "aiken",
    "documentation",
    "cardano",
    "blockchain",
    "smart-contracts",
    "stdlib",
    "prelude",
    "vodka",
    "typescript",
    "nextjs",
    "react",
  ],
  authors: [{ name: "Don's Docs Team", url: "https://dons-docs.com" }],
  creator: "Don's Docs Team",
  publisher: "Don's Docs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dons-docs.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dons-docs.com",
    title: "Don's Docs - Aiken Library Documentation Browser",
    description:
      "Interactive documentation browser for Aiken libraries including stdlib, prelude, and vodka packages.",
    siteName: "Don's Docs",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Don's Docs - Aiken Library Documentation Browser",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Don's Docs - Aiken Library Documentation Browser",
    description:
      "Interactive documentation browser for Aiken libraries including stdlib, prelude, and vodka packages.",
    images: ["/logo.png"],
    creator: "@donsdocs",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "documentation",
  classification: "documentation",
  other: {
    "theme-color": "#000000",
    "color-scheme": "dark light",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Don's Docs",
    "application-name": "Don's Docs",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
