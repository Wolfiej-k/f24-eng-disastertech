"use client";
import { TypographyP } from "@/components/ui/typography";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import AddDocumentForm from "./add-document-form";
import DocumentCard from "./document-card";
import { Document } from "./schema";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      const user = await getUser();
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

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
      <div className="p-6">
        <TypographyP>Error loading documents.</TypographyP>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <TypographyP>Loading...</TypographyP>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-3 flex justify-center">
        <AddDocumentForm />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} editable={true} />
        ))}
      </div>
    </div>
  );
}
