import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ImagineX.ai — Beautiful Next.js Site",
  description: "A clean, responsive Next.js starter with Home, About and Contact pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
          <Navbar />

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-black/[.06] py-6">
            <div className="container mx-auto px-6 text-center text-sm text-zinc-600">
              © {new Date().getFullYear()} ImagineX.ai • Built with Next.js
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
