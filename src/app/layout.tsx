import { Navbar } from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/toaster";
import { getUser } from "@/lib/auth";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Offline AI",
  description: "T4SG × Disaster Tech Labs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="h-screen overflow-hidden font-sans">
        <Navbar user={user} />
        <main className="h-full overflow-auto pt-24">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
