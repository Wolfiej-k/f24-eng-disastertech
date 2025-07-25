import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentsList from "./documents-list";

export default async function StatsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  return <DocumentsList />;
}
