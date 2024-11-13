import Header from "@/components/ui/header";
import AddDocumentForm from "./add-document-form";
import DocumentsList from "./documents-list";

export default function Documents() {
  return (
    <>
      <Header title="Documents" subtitle="Manage documents in the knowledge base." button={<AddDocumentForm />} />
      <DocumentsList />
    </>
  );
}
