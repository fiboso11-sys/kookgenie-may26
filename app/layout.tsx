import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PwaRoot } from "@/components/pwa/pwa-root";
import "./globals.css";
import "../styles/brand-overrides.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KookGenie — Cook Smart. Live Healthy.",
  description:
    "AI-powered cooking, health, and fitness platform. Recipes, meal plans, workouts, and health tracking.",
  applicationName: "KookGenie",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KookGenie",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#065f46" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen min-h-[100dvh] touch-manipulation antialiased">
        <ThemeProvider>
          <PwaRoot />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
