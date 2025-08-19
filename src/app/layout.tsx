import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config as faConfig } from "@fortawesome/fontawesome-svg-core";
faConfig.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          themes={["light", "dark"]}
          disableTransitionOnChange
        >
          {/* Initialize Font Awesome library icons */}
          {/* Optional: import '@/lib/fontawesome' here if you want to pre-add icons */}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
