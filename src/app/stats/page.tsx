import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import StatsGrid from "./stats-grid";

export default async function StatsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }

  return <StatsGrid />;
}
