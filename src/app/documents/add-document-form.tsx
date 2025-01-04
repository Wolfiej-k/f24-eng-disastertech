"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TypographyP } from "@/components/ui/typography";
import { getUser } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormData, schema } from "./schema";

export default function AddDocumentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const user = await getUser();
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add document!");
    }

    reset();
    window.location.reload();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-lg">
          <PlusCircle /> <span>&nbsp;</span>Add Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
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
              {isSubmitting ? "Adding..." : "Add Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
