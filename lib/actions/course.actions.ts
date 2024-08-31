"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Course from "../models/course.model";
import Note from "../models/note.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function createCourse(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  try {
    connectToDB();

    // Find the user with the provided unique id
    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found"); // Handle the case if the user with the id is not found
    }

    const newCourse = new Course({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id, // Use the mongoose ID of the user
    });

    const createdCourse = await newCourse.save();

    // Update User model
    user.communities.push(createdCourse._id);
    await user.save();

    return createdCourse;
  } catch (error) {
    // Handle any errors
    console.error("Error creating Course:", error);
    throw error;
  }
}

export async function fetchCourseDetails(id: string) {
  try {
    connectToDB();

    const CourseDetails = await Course.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return CourseDetails;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching Course details:", error);
    throw error;
  }
}

export async function fetchCoursePosts(id: string) {
  try {
    connectToDB();

    const CoursePosts = await Course.findById(id).populate({
      path: "Note",
      model: Note,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: "children",
          model: Note,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });

    return CoursePosts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching Course posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Course> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Course.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Course.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCourse(CourseId: string, memberId: string) {
  try {
    connectToDB();

    // Find the Course by its unique id
    const course = await Course.findOne({ id: CourseId });

    if (!course) {
      throw new Error("Course not found");
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the Course
    if (course.members.includes(user._id)) {
      throw new Error("User is already a member of the Course");
    }

    // Add the user's _id to the members array in the Course
    course.members.push(user._id);
    await course.save();

    // Add the Course's _id to the communities array in the user
    user.communities.push(course._id);
    await user.save();

    return course;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to Course:", error);
    throw error;
  }
}

export async function removeUserFromCourse(userId: string, CourseId: string) {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const CourseIdObject = await Course.findOne({ id: CourseId }, { _id: 1 });

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!CourseIdObject) {
      throw new Error("Course not found");
    }

    // Remove the user's _id from the members array in the Course
    await Course.updateOne(
      { _id: CourseIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    // Remove the Course's _id from the communities array in the user
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: CourseIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from Course:", error);
    throw error;
  }
}

export async function updateCourseInfo(
  CourseId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    connectToDB();

    // Find the Course by its _id and update the information
    const updatedCourse = await Course.findOneAndUpdate(
      { id: CourseId },
      { name, username, image }
    );

    if (!updatedCourse) {
      throw new Error("Course not found");
    }

    return updatedCourse;
  } catch (error) {
    // Handle any errors
    console.error("Error updating Course information:", error);
    throw error;
  }
}

export async function deleteCourse(CourseId: string) {
  try {
    connectToDB();

    // Find the Course by its ID and delete it
    const deletedCourse = await Course.findOneAndDelete({
      id: CourseId,
    });

    if (!deletedCourse) {
      throw new Error("Course not found");
    }

    // Delete all Note associated with the Course
    await Note.deleteMany({ Course: CourseId });

    // Find all users who are part of the Course
    const CourseUsers = await User.find({ communities: CourseId });

    // Remove the Course from the 'communities' array for each user
    const updateUserPromises = CourseUsers.map((user) => {
      user.communities.pull(CourseId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCourse;
  } catch (error) {
    console.error("Error deleting Course: ", error);
    throw error;
  }
}
