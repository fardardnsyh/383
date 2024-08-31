"use server";

interface Params {
  userId: string;
  username: string;
  name: string;
  image: string;
  bio: string;
  path: string;
}
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Note from "../models/note.model";
import { FilterQuery, SortOrder } from "mongoose";

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  const result = await User.findOneAndUpdate(
    { id: userId },
    { username: username.toLowerCase(), name, bio, image, onboarded: true },
    { upsert: true }
  );

  try {
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error("Failed to create/update USER", error.message);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
    // .populate({
    //   path: courses,
    //   model: "courses",
    // });
  } catch (error) {}
}

export async function fetchUserNotes(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId }).populate({
      path: "notes",
      model: Note,
      populate: [
        {
          path: "children",
          model: Note,
          populate: {
            path: "author",
            model: User,
            select: "id name image",
          },
        },
      ],
    });
  } catch (error: any) {
    throw new Error("Failed to fetch user notes", error.message);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };
    if (searchString) {
      query.$or = [{ name: regex }, { username: regex }];
    }
    const sortOptions = { createdAt: sortBy };
    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();
    const isNext = totalUsersCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error("Failed to fetch users", error.message);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    const userNotes = await Note.find({ author: userId });

    //collect all child thread ids (replies)
    const childNoteIds = userNotes.reduce((acc, userNote) => {
      return acc.concat(userNote.children);
    }, []);

    //const replies

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Note.find({
      _id: { $in: childNoteIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
    return replies;
  } catch (error: any) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}
