import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
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
    default: "Radvac — Rapid Deployment Vaccine Collaborative",
    template: "%s | Radvac",
  },
  description:
    "Radvac is a 501(c)(3) nonprofit developing rapid, open-source medical countermeasures and self-administered nasal vaccines.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://radvac.org"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Radvac",
    images: [
      {
        url: "/images/radvac-logo-darkblue-for-social-media-preview.png",
        width: 1200,
        height: 1200,
        alt: "Radvac — Rapid Deployment Vaccine Collaborative",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: ["/images/radvac-logo-darkblue-for-social-media-preview.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Radvac",
  alternateName: "Rapid Deployment Vaccine Collaborative",
  url: SITE_URL,
  logo: `${SITE_URL}/images/radvac-logo-darkblue-for-social-media-preview.png`,
  nonprofitStatus: "Nonprofit501c3",
  email: "info@radvac.org",
  sameAs: [
    "https://www.facebook.com/radvacproject",
    "https://x.com/radvacproject",
    "https://www.instagram.com/radvacproject",
    "https://bsky.app/profile/radvacproject.bsky.social",
    "https://www.youtube.com/channel/UCYZeqhoSbe5cD1aJgtfX3-Q",
    "https://substack.com/@radvac",
  ],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Radvac",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
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
