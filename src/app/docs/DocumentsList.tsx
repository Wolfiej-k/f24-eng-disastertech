"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import EditDocDialog from "./EditDocDialog";
import Link from "next/link";

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const DocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://api:4000/documents");
      if (!response.ok) {
        console.log(response.statusText);
        throw new Error("Failed to fetch documents, " + response.statusText);
      }
      const data: Document[] = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return <TypographyP>Loading documents...</TypographyP>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>
              <Link href={`/docs/${doc.id}`} className="text-blue-600 hover:underline">
                {doc.title}
              </Link>
            </CardTitle>
            <TypographyP className="text-sm text-muted-foreground">
              Created at: {new Date(doc.created_at).toLocaleString()}
            </TypographyP>
          </CardHeader>
          <CardContent>
            <TypographyP>{doc.content}</TypographyP>
          </CardContent>
          <CardFooter className="flex justify-end">
            <EditDocDialog document={doc} onUpdate={fetchDocuments} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DocumentsList;
