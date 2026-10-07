import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({ src: "./fonts/geist-latin.woff2", weight: "100 900", variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  title: "The Humor Project",
  description: "A small corner of the internet built for bigger laughs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
