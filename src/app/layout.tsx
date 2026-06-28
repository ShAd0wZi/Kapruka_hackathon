import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kade — Your Smart Shopping Companion | Kapruka",
  description:
    "Kade is an AI-powered shopping assistant for Kapruka.com — Sri Lanka's largest e-commerce platform. Browse products, check delivery, and checkout — all through a beautiful chat experience. Supports English, Sinhala, and Tanglish.",
  keywords: ["Kapruka", "AI shopping", "Sri Lanka", "e-commerce", "Kade", "MCP"],
  openGraph: {
    title: "Kade — AI Shopping Companion for Kapruka",
    description: "Shop smarter on Sri Lanka's largest e-commerce platform with Kade, your AI shopping buddy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-[var(--font-inter)] antialiased bg-bg-primary text-text-primary h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
