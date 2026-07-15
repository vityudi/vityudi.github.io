import type { Metadata } from "next";
import { Unbounded, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
import { StatusBar } from "@/components/StatusBar";
import { TopBar } from "@/components/TopBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=document.documentElement;if(t==="light"){d.classList.remove("dark");d.classList.add("light");}else{d.classList.remove("light");d.classList.add("dark");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${unbounded.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased min-h-screen text-foreground font-sans relative pb-7`}>
        <MouseGridBackground />
        <ScrollProgress />
        <TopBar />
        <div className="relative z-1">
          {children}
        </div>
        <StatusBar />
      </body>
    </html>
  );
}
