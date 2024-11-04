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
import AddDocForm from "./add-doc-form";

interface AddDocDialogProps {
  onDocAdded: () => void;
}

const AddDocDialog: React.FC<AddDocDialogProps> = ({ onDocAdded }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
          <DialogDescription>
            Fill in the details of the new document.
          </DialogDescription>
        </DialogHeader>
        <AddDocForm onSuccess={onDocAdded} />
        <DialogClose asChild>
          <Button variant="ghost" className="mt-4">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocDialog;
