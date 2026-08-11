import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Ropalia | Moda que se adapta a ti";
  const description = "Compra y alquila ropa casual y formal en Bolivia. Prendas únicas, cerca de ti.";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: { icon: "/ropalia-mark.svg", shortcut: "/ropalia-mark.svg" },
    openGraph: { title, description, type: "website", locale: "es_BO", images: [{ url: `${origin}/og.png`, width: 1736, height: 907, alt: "Ropalia — Tu estilo, sin límites" }] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
