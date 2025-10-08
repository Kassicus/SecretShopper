import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Secret Shopper - Family Gift Coordinator",
  description: "Track family preferences and coordinate gift purchases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light" storageKey="secret-shopper-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
