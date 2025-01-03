"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";

const routes = {
  "/": "Home",
  "/documents": "Documents",
  "/stats": "Stats",
};

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-10 w-full bg-primary px-2 py-1">
      <div className="flex items-center justify-between bg-primary px-6 py-4">
        <div className="flex items-center">
          <Link href="/">
            <Image src="/logo.png" alt="Disaster Tech Lab Logo" width="64" height="64" className="mr-4" />
          </Link>
          <h1 className="hidden text-2xl font-bold text-white lg:block">
            Offline AI
            <span className="mx-4 border-l border-r border-white"></span>
            Disaster Tech Lab
          </h1>
        </div>
        <div className="flex items-center">
          <ul className="flex space-x-4">
            {Object.entries(routes).map(([route, title]) => (
              <li key={route}>
                <Link
                  href={route}
                  className={`text-white transition-colors hover:text-gray-200 ${route == pathname ? "underline underline-offset-4" : ""}`}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mu-2 relative ml-6 mt-1">
            <Popover>
              <PopoverTrigger>
                <CircleUser size={24} className="text-white hover:text-gray-200" />
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">john@example.com</p>
                  </div>
                  <Button variant="destructive">Log Out</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
}
