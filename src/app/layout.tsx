import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vitor Yudi - Fullstack & DevOps",
  description: "DevOps, Cloud Engineer and Fullstack Developer Portfolio",
};

import { ScrollProgress } from "@/components/ScrollProgress";

import { MouseGridBackground } from "@/components/MouseGridBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} antialiased min-h-screen text-foreground font-sans relative`}>
        <MouseGridBackground />
        <ScrollProgress />
        <div className="relative z-1">
          {children}
        </div>
      </body>
    </html>
  );
}
