"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface User {
  username: string;
  token: string;
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

  if (!response.ok) {
    return null;
  }

  const { token } = await response.json();
  if (!token) {
    return null;
  }

  const user = { username, token };
  cookies().set("user", JSON.stringify(user), {
    secure: true,
    sameSite: "strict",
  });

  return user;
}

export async function logoutUser() {
  cookies().delete("user");
  redirect("/");
}

export async function getUser() {
  console.log(cookies().getAll());

  const cookie = cookies().get("user");
  if (!cookie) {
    return null;
  }

  return JSON.parse(cookie.value) as User;
}
