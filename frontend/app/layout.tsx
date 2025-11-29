import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
          <header className="border-b border-black/[.06] bg-gradient-to-b from-white to-transparent dark:from-black/80 py-4">
            <div className="container mx-auto flex items-center justify-between px-6">
              <a href="/" className="text-lg font-semibold tracking-tight">
                ImagineX.ai
              </a>
              <nav className="flex items-center gap-4 text-sm">
                <a href="/" className="hover:underline">
                  Home
                </a>
                <a href="/about" className="hover:underline">
                  About
                </a>
                <a href="/contact" className="rounded-md bg-foreground/95 text-background px-4 py-2 text-sm hover:opacity-95">
                  Contact
                </a>
              </nav>
            </div>
          </header>

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
