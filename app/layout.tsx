import type { Metadata } from "next";
import { Archivo, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const archivoHeading = Archivo({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "The competitive programming platform for universities. Track progress, compare with peers, and discover top coders.";

export const metadata: Metadata = {
  metadataBase: new URL("https://leetrank.example"),
  title: {
    default: "LeetRank — University Competitive Programming Leaderboards",
    template: "%s · LeetRank",
  },
  description,
  openGraph: {
    title: "LeetRank",
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetRank",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "scroll-smooth",
        "antialiased",
        geistMono.variable,
        "font-sans",
        inter.variable,
        archivoHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="leetrank-system-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
