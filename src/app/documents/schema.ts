import { z } from "zod";

export interface Document {
  id: number;
  title: string;
  content: string;
  created_at: Date;
}

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type FormData = z.infer<typeof schema>;
