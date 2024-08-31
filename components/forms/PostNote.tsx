"use client";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { usePathname, useRouter } from "next/navigation";

import { NotesValidation } from "@/lib/validations/note";
import { createNotes } from "@/lib/actions/note.action";

export default function PostNote({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof NotesValidation>>({
    resolver: zodResolver(NotesValidation),
    defaultValues: {
      note: "",
      accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof NotesValidation>) => {
    await createNotes({
      text: values.note,
      author: userId,
      courseId: null,
      path: pathname,
    });

    router.push("/");
  };
  return (
    <div>
      <h1>Post Thread Form</h1>
      <Form {...form}>
        <form
          className="mt-10 flex flex-col justify-start gap-10 "
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="text-base-semibold text-light-2">
                  Content
                </FormLabel>
                <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                  <Textarea rows={15} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="bg-primary-500">
            Post NOTE
          </Button>
        </form>
      </Form>
    </div>
  );
}
