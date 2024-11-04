import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditDocForm from "./EditDocForm";

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface EditDocDialogProps {
  document: Document;
  onUpdate: () => void;
}

const EditDocDialog: React.FC<EditDocDialogProps> = ({ document, onUpdate }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Modify the details of the document.
          </DialogDescription>
        </DialogHeader>
        <EditDocForm
          initialData={{ title: document.title, content: document.content }}
          onSuccess={onUpdate}
          documentId={document.id}
        />
        <DialogClose asChild>
          <Button variant="ghost" className="mt-4">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocDialog; 
