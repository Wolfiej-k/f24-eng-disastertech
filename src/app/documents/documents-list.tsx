"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { useEffect, useState } from "react";
import EditDocumentForm from "./edit-document-form";
import { Document } from "./schema";

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/documents`);
      if (!response.ok) {
        setError(true);
        return;
      }

      const data = await response.json();
      setDocuments(data);
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  if (error) {
    return (
      <div className="m-6">
        <TypographyP>Error loading documents.</TypographyP>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="m-6">
        <TypographyP>Loading...</TypographyP>
      </div>
    );
  }

  return (
    <div className="m-6 grid grid-cols-1 gap-4">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {doc.title}
              <div className="flex justify-end">
                <EditDocumentForm document={doc} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TypographyP>{doc.content}</TypographyP>
          </CardContent>
          <CardFooter>
            <div className="mt-1 text-xs text-gray-500">
              {new Date(doc.created_at)
                .toLocaleTimeString([], {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .split("T")
                .join(", ")}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
