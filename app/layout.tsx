import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
