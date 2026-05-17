import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RaDVaC — Rapid Deployment Vaccine Collaborative",
    template: "%s | RaDVaC",
  },
  description:
    "RaDVaC is a 501(c)(3) nonprofit developing rapid, open-source medical countermeasures and self-administered nasal vaccines.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://radvac.org"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RaDVaC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        <div className="wrap">
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
