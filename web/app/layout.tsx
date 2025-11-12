import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const hellix = localFont({
  src: [
    {
      path: "./fonts/Hellix-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Hellix-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Hellix-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Hellix-RegularItalic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-hellix",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pookiey Premium",
  description:
    "Manage your Pookiey dating subscription, track payments, and unlock premium perks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hellix.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
