"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import EditDocDialog from "../EditDocDialog";

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const DocumentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`http://api:4000/documents/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      const data: Document = await response.json();
      setDocument(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  if (loading) {
    return <TypographyP>Loading document...</TypographyP>;
  }

  if (error) {
    return <TypographyP className="text-red-500">{error}</TypographyP>;
  }

  if (!document) {
    return <TypographyP>Document not found.</TypographyP>;
  }

  return (
    <div className="container mx-auto p-4">
      <TypographyH1>{document.title}</TypographyH1>
      <TypographyP className="text-sm text-muted-foreground mb-2">
        Created at: {new Date(document.created_at).toLocaleString()}
      </TypographyP>
      <TypographyP>{document.content}</TypographyP>
      <div className="mt-4">
        <EditDocDialog document={document} onUpdate={fetchDocument} />
        <Button className="ml-2" onClick={() => router.push("/docs")}>
          Back to Documents
        </Button>
      </div>
    </div>
  );
};

export default DocumentDetailPage; 
