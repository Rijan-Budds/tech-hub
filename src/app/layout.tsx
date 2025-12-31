import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config as faConfig } from "@fortawesome/fontawesome-svg-core";
faConfig.autoAddCss = false;

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wayne Enterprise",
  description: "Online Shopping in Nepal: Wayne Enterprises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased h-screen selection:bg-primary/20`}
      >
        <div className="h-full overflow-auto no-visible-scrollbar">
          {children}
        </div>

        <Toaster />
      </body>
    </html>
  );
}
