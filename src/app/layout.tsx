import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Offline AI",
  description: "T4SG × Disaster Tech Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden font-sans">
        <Navbar />
        <main className="h-full overflow-auto pt-24">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
