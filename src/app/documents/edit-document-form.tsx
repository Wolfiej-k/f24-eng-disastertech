"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TypographyP } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Document, FormData, schema } from "./schema";

interface EditDocumentFormProps {
  document: Document;
}

export default function EditDocumentForm({ document }: EditDocumentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: document.title, content: document.content },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/documents/${document.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update document!");
      }

      reset();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const onDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/documents/${document.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document!");
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-row">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <Pencil />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <Input id="title" {...register("title")} className="mt-1 block w-full" placeholder="Title" />
              {errors.title && <TypographyP className="mt-1 text-sm text-red-500">{errors.title.message}</TypographyP>}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                {...register("content")}
                className="mt-1 block w-full"
                placeholder="Content"
                rows={12}
              />
              {errors.content && (
                <TypographyP className="mt-1 text-sm text-red-500">{errors.content.message}</TypographyP>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="ghost" type="button" onClick={() => reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="ml-2">
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
