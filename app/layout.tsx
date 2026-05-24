import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Luxy Experience",
  description: "Dashboard gestione prenotazioni Luxy Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#070A0D] text-[#F4F0E6]">
        {children}
      </body>
    </html>
  );
}
