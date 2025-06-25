// layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Direct Democracy",
  description: "Empowering Sarawak through digital democracy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black text-white scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased tracking-tight m-0 p-0 font-mono bg-gradient-to-br from-zinc-950 via-black to-gray-900`}
      >
        <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
          {/* Tactical Header Bar */}
          <Header />

          {/* Main Page Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-4">
            {children}
          </main>

          {/* Futuristic Footer */}
          <footer className="w-full py-4 px-6 bg-zinc-900 text-xs text-center text-zinc-400 border-t border-zinc-700">
            <p className="text-[11px] tracking-wider uppercase">
              © {new Date().getFullYear()} Direct Democracy
            </p>
            <p className="mt-1 italic">Engineered by Nistelrooy Reynold anak Naomi</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
