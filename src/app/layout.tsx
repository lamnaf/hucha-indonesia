import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { Toaster } from "@/components/toaster";
import { siteConfig } from "@/lib/mock/site";
import { DEFAULT_OG_IMAGE, siteUrl } from "@/lib/seo";

const fontDynamo = localFont({
  src: "../../public/Dynamo MN Bold.ttf",
  variable: "--font-dynamo",
  display: "swap",
});

const fontMontserrat = Montserrat({
  weight: ["400", "700"],
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
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      className={`${fontMontserrat.variable} ${fontDynamo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
