import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webzam",
  description: "Design intelligence scanner - Extract design tokens and brand vibe from any website",
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
