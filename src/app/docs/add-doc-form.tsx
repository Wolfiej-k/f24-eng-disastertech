import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TypographyP } from "@/components/ui/typography";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof schema>;

interface AddDocFormProps {
  onSuccess: () => void;
}

const AddDocForm: React.FC<AddDocFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("http://api:4000/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to add document");
      }

      reset();
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to add document");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          {...register("title")}
          className="mt-1 block w-full"
          placeholder="Document Title"
        />
        {errors.title && (
          <TypographyP className="text-red-500 text-sm mt-1">
            {errors.title.message}
          </TypographyP>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium">
          Content
        </label>
        <Textarea
          id="content"
          {...register("content")}
          className="mt-1 block w-full"
          placeholder="Document Content"
          rows={4}
        />
        {errors.content && (
          <TypographyP className="text-red-500 text-sm mt-1">
            {errors.content.message}
          </TypographyP>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Document"}
        </Button>
      </div>
    </form>
  );
};

export default AddDocForm; 
