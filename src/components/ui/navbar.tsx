"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TypographyP } from "@/components/ui/typography";
import type { User } from "@/lib/auth";
import { loginUser, logoutUser } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./button";

interface NavbarProps {
  user: User | null;
}

const schema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type FormData = z.infer<typeof schema>;

export function Navbar({ user }: NavbarProps) {
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const routes = new Map<string, string>();
  routes.set("/", "Home");

  if (user) {
    routes.set("/documents", "Documents");
    routes.set("/stats", "Stats");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ username, password }: FormData) => {
    const user = await loginUser(username, password);
    if (!user) {
      setError("Invalid credentials.");
      return;
    }

    reset();
    window.location.reload();
  };

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
            {[...routes.entries()].map(([route, title]) => (
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
            {user ? (
              <Popover>
                <PopoverTrigger>
                  <CircleUser size={24} className="text-white hover:text-gray-200" />
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex items-start justify-between">
                    <span className="text-md font-medium">{user.username}</span>
                    <Button variant="destructive" onClick={() => void logoutUser()}>
                      Log Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Dialog>
                <DialogTrigger>
                  <CircleUser size={24} className="text-white hover:text-gray-200" />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log In</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium">
                        Username
                      </label>
                      <Input
                        id="username"
                        {...register("username")}
                        className="mt-1 block w-full"
                        placeholder="Username"
                      />
                      {errors.username && (
                        <TypographyP className="mt-1 text-sm text-red-500">{errors.username.message}</TypographyP>
                      )}
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium">
                        Password
                      </label>
                      <Input
                        id="password"
                        {...register("password")}
                        className="mt-1 block w-full"
                        placeholder="Password"
                        type="password"
                      />
                      {errors.password && (
                        <TypographyP className="mt-1 text-sm text-red-500">{errors.password.message}</TypographyP>
                      )}
                    </div>
                    <div>{error && <TypographyP className="mt-1 text-sm text-red-500">{error}</TypographyP>}</div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" type="button" onClick={() => reset()}>
                        Reset
                      </Button>
                      <Button type="submit">Submit</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
