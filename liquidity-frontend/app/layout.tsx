import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liquidity Lite",
  description: "Agent, coordinator and admin dashboards demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} min-h-screen flex flex-col bg-gray-900 text-gray-100`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
