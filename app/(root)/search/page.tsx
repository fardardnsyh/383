import { fetchUsers, fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import NotesTab from "@/components/shared/NotesTab";
import UserCard from "@/components/cards/UserCard";

const Page = async () => {
  const user = await currentUser();
  console.log(user);
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  //fetch users
  const results = await fetchUsers({
    userId: user.id,
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });
  return (
    <>
      <h1 className="text-2xl text-light-1">Search</h1>
      <p>Search for anything</p>
      <div className="mt-14 flex flex-col gap-9">
        {results.users.length === 0 ? (
          <p className="no result">No Users</p>
        ) : (
          <>
            {results.users.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                imgUrl={user.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};
export default Page;
