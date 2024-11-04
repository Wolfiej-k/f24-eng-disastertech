"use client";

import React from "react";
import AddDocDialog from "./AddDocDialog";
import DocumentsList from "./DocumentsList";
import { TypographyH1, TypographyP } from "@/components/ui/typography";

const DocsPage: React.FC = () => {
  const [refresh, setRefresh] = React.useState<boolean>(false);

  const handleDocAdded = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="container mx-auto p-4">
      <TypographyH1>Documents</TypographyH1>
      <TypographyP className="mb-4">
        Manage your documents by adding, viewing, and editing them.
      </TypographyP>
      <AddDocDialog onDocAdded={handleDocAdded} />
      <DocumentsList key={refresh ? "refresh" : "initial"} />
    </div>
  );
};

export default DocsPage;
