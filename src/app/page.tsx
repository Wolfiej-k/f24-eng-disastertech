import { TypographyH1 } from "@/components/ui/typography";

export default async function Home() {
  const response = await fetch("http://api:4000/documents");
  if (!response.ok) {
    throw new Error("Could not fetch documents!");
  }

  const data = await response.json();
  console.log(data);

  return <TypographyH1>Welcome to T4SG!</TypographyH1>;
}
