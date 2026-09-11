import type { Metadata, Viewport } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/toaster";
import { siteConfig } from "@/lib/mock/site";
import { DEFAULT_OG_IMAGE, siteUrl } from "@/lib/seo";

const fontAnton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const fontMontserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "HuCha Indonesia",
    template: "%s | HuCha Indonesia",
  },
  description: siteConfig.description,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    siteName: siteConfig.name,
    locale: "id_ID",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2c0478",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fontAnton.variable} ${fontMontserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
