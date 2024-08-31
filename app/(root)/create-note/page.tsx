import PostNote from "@/components/forms/PostNote";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <>
      <h1 className="head-text">Create Note</h1>
      <PostNote userId={userInfo._id} />
    </>
  );
}

export default Page;
