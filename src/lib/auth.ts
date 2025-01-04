"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface User {
  username: string;
  access: string;
  refresh: string;
}

export async function loginUser(username: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  const { access, refresh } = await response.json();
  if (!response.ok || !access || !refresh) {
    return null;
  }

  const user: User = { username, access, refresh };
  cookies().set("user", JSON.stringify(user), { secure: true });

  return user;
}

export async function logoutUser() {
  cookies().delete("user");
  redirect("/");
}

export async function getUser() {
  const cookie = cookies().get("user")?.value;
  if (!cookie) {
    return null;
  }

  return JSON.parse(cookie) as User;
}

export async function refreshUser() {
  let user = await getUser();
  if (!user) {
    return null;
  }

  const { username, refresh } = user;
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refresh}`,
    },
  });

  const { access } = await response.json();
  if (!response.ok || !access) {
    return null;
  }

  user = { username, access, refresh };
  cookies().set("user", JSON.stringify(user), { secure: true });

  return user;
}
