import NoteCard from "@/components/cards/NoteCard";
import { fetchPosts } from "@/lib/actions/note.action";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  const user = await currentUser();
  const result = await fetchPosts(1, 30);
  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="flex flex-col items-center justify-center">
        {result.posts.length === 0 ? (
          <p>No notes founds</p>
        ) : (
          result.posts.map((post) => (
            <NoteCard
              key={post._id}
              id={post._id}
              currrentUserId={user?.id || ""}
              parentId={post.parentId}
              content={post.text}
              author={post.author}
              community={post.community}
              createdAt={post.createdAt}
              comments={post.children}
            />
          ))
        )}
      </section>
    </>
  );
}
