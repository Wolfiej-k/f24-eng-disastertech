import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import EditDocumentForm from "./edit-document-form";
import { Document } from "./schema";

interface DocumentCardProps {
  document: Document;
  editable: boolean;
}

export default function DocumentCard({ document, editable }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {document.title}
          {editable && (
            <div className="flex justify-end">
              <EditDocumentForm document={document} />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TypographyP>{document.content}</TypographyP>
      </CardContent>
      <CardFooter>
        <div className="pt-1 text-xs text-gray-500">
          {new Date(document.created_at)
            .toLocaleTimeString([], {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
            .split("T")
            .join(", ")}
          , Searches: {document.searches}
        </div>
      </CardFooter>
    </Card>
  );
}
