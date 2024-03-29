"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import BuzzWeft from "../models/buzzWeft.model";
import Community from "../models/community.model";
import { FilterQuery, SortOrder } from "mongoose";
interface Props {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Props): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message} `);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    //find all buzzs authored by user with the given userId
    const buzzWefts = await User.findOne({ id: userId }).populate({
      path: "buzzWefts",
      model: BuzzWeft,
      populate: [
        {
          path: "community",
          model: Community,
          select: " name id image _id",
        },
        {
          path: "children",
          model: BuzzWeft,
          populate: {
            path: "author",
            model: User,
            select: " name image id ",
          },
        },
      ],
    });
    return buzzWefts;
  } catch (error) {
    throw error;
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

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const userQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUserCount = await User.countDocuments(query);
    const users = await userQuery.exec();

    const isNext = totalUserCount > skipAmount + users.length;
    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // find all buzz created by the ser
    const userBuzzs = await BuzzWeft.find({ author: userId });

    //Collect all the child buzz ids (replies) from the field
    const childBuzzs = userBuzzs.reduce((acc, userBuzzs) => {
      return acc.concat(userBuzzs.children);
    }, []);

    const replies = await BuzzWeft.find({
      _id: { $in: childBuzzs },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: " name image _id ",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
