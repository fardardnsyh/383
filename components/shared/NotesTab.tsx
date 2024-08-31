import { fetchUserNotes } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import NoteCard from "../cards/NoteCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const NotesTab = async ({ currentUserId, accountId, accountType }: Props) => {
  //Fetch profile notes
  let result = await fetchUserNotes(accountId);
  //   if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result?.notes.map((note: any) => (
        <NoteCard
          key={note._id}
          id={note._id}
          currrentUserId={currentUserId}
          parentId={note.parentId}
          content={note.text}
          author={
            accountType === "User"
              ? {
                  name: result.name,
                  image: result.image,
                  id: result.id,
                }
              : {
                  name: note.author.name,
                  image: note.author.image,
                  id: note.author.id,
                }
          }
          //   community={note.community}
          createdAt={note.createdAt}
          comments={note.children}
        />
      ))}
    </section>
  );
};

export default NotesTab;
