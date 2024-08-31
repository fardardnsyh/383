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
import { CommentValidation } from "@/lib/validations/note";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { addCommentToNote } from "@/lib/actions/note.action";
import { revalidatePath } from "next/cache";

interface Props {
  noteId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comments = ({ noteId, currentUserImg, currentUserId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      note: "",
      // accountId: userId,
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToNote(
      noteId,
      values.note,
      JSON.parse(currentUserId),
      pathname
    );

    form.reset();
  };

  return (
    <div>
      <h1 className="text-white">CommentForm</h1>
      <div>
        <Form {...form}>
          <form
            className="comment-form "
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="flex w-full items-center gap-3">
                  <FormLabel>
                    <Image
                      src={currentUserImg}
                      alt="Profile image"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </FormLabel>
                  <FormControl className="border-none bg-transparent">
                    <Input
                      type="text"
                      placeholder="Comment"
                      className="no-focus text-light-1 outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="comment-form_btn">
              Reply
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Comments;
