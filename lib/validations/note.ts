import * as z from "zod";

export const NotesValidation = z.object({
  note: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  note: z.string().nonempty().min(3, { message: "Minimum 3 characters" }),
});
