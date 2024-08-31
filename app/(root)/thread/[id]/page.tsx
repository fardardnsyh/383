import NoteCard from "@/components/cards/NoteCard";
import Comments from "@/components/forms/Comment";
import { fetchNoteById } from "@/lib/actions/note.action";
import { fetchUser } from "@/lib/actions/user.action";
import Note from "@/lib/models/note.model";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) {
    return null;
  }

  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const note = await fetchNoteById(params.id);
  return (
    <section className="relative">
      <div>
        <NoteCard
          key={note._id}
          id={note._id}
          currrentUserId={user?.id || ""}
          parentId={note.parentId}
          content={note.text}
          author={note.author}
          community={note.community}
          createdAt={note.createdAt}
          comments={note.children}
        />
      </div>
      <div className="mt-7">
        <Comments
          noteId={note.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>
      <div className="mt-10">
        {note.children.map((comment: any) => (
          <NoteCard
            key={comment._id}
            id={comment._id}
            currrentUserId={comment?.id || ""}
            parentId={comment.parentId}
            content={comment.text}
            author={comment.author}
            community={comment.community}
            createdAt={comment.createdAt}
            comments={comment.children}
            isComment={true}
          />
        ))}
      </div>
    </section>
  );
};

export default Page;
