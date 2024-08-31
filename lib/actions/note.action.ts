"use server";

import Note from "../models/note.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  courseId: string | null;
  path: string;
}

export async function createNotes({ text, author, courseId, path }: Params) {
  try {
    connectToDB();
    const note = await Note.create({
      text,
      author,
      courses: null,
    });
    await User.findByIdAndUpdate(author, {
      $push: { notes: note._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Failed to create Thread", error.message);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    //fetch that have no parents
    const postsQuery = Note.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Note.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const posts = await postsQuery.exec();
    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error("Failed to fetch posts", error.message);
  }
}

export async function fetchNoteById(id: string) {
  connectToDB();
  try {
    const note = await Note.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id name parentId image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id name parentId image",
          },
          {
            path: "children",
            populate: {
              path: "author",
              model: User,
              select: "_id name parentId image",
            },
          },
        ],
      })
      .exec();

    return note;
  } catch (error: any) {
    throw new Error("Failed to fetch thread", error.message);
  }
}

export async function addCommentToNote(
  noteId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    const originalNote = await Note.findById(noteId);
    if (!originalNote) {
      throw new Error("Note not found");
    }
    // create a new note with comment text

    const commentNote = new Note({
      text: commentText,
      author: userId,
      parentId: noteId,
    });

    const savedCommentNote = await commentNote.save();

    // add the comment note to the original note
    originalNote.children.push(savedCommentNote._id);

    //save original note
    await originalNote.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error("Failed to add comment to note", error.message);
  }
}
