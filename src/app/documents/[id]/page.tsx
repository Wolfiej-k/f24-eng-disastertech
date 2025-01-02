import { TypographyP } from "@/components/ui/typography";
import DocumentCard from "../document-card";
import { Document } from "../schema";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/documents/${params.id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <div className="p-6">
        <TypographyP>Error loading document.</TypographyP>
      </div>
    );
  }

  const document = (await response.json()) as Document;
  return (
    <div className="px-24 py-8">
      <DocumentCard document={document} editable={false} />
    </div>
  );
}
