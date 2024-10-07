import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Offline AI",
  description: "T4SG / Disaster Tech Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
