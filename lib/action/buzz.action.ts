"use server";
import { revalidatePath } from "next/cache";
import BuzzWeft from "../models/buzzWeft.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Props {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createBuzz({ text, author, communityId, path }: Props) {
  try {
    connectToDB();
    const createdBuzz = await BuzzWeft.create({
      text,
      author,
      community: null,
    });
    // update user model
    await User.findByIdAndUpdate(author, {
      $push: { buzzWefts: createdBuzz._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating buzz: ${error.message}`);
  }
}

export async function fetchPost(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // Fetch the posts that have no parent (top-level threads..)
  const postQuery = BuzzWeft.find({ parentId: { $in: [null, undefined] } })
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

    const totalPostsCount = await BuzzWeft.countDocuments({ parentId: { $in: [ null, undefined ]} });

    const posts = await postQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}

export async function fetchBuzzWeftById(buzzWeftId: string) {
  connectToDB();

  try {

    // Populate community
    const buzzWeft = await BuzzWeft.findById(buzzWeftId)
      .populate({
        path: 'author',
        model: User,
        select: "_id id name image"
      })
      // .populate({
      //   path: "community",
      //   model: Community,
      //   select: "_id id name image",
      // })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: " _id id name parentId image"
          },
          {
            path: 'children',
            model: BuzzWeft,
            populate: {
              path: 'author',
              model: User,
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();
      return buzzWeft;
  } catch (error: any) {
    throw new Error(`Failed to fetch buzzWefts: ${error.message}`)
  }
}

export async function addCommentToBuzzWeft(
  buzzWeftId: string,
  commentText: string,
  userId: string,
  path: string,
) {
  connectToDB();
  try {
    // Find original Buzz by id
    const originalBuzzWeft = await BuzzWeft.findById(buzzWeftId);

    if(!originalBuzzWeft) {
      throw new Error("BuzzWeft not found");
    }

    // create a new buzz with the comment text
    const commentBuzzWeft = new BuzzWeft({
      text: commentText,
      author: userId,
      parentId: buzzWeftId,
    })

    // save the new buzzWeft
    const saveCommentBuzzWeft = await commentBuzzWeft.save();

    // update the original buzzWeft to include the new comment
    originalBuzzWeft.children.push(saveCommentBuzzWeft._id);

    // save the original BuzzWeft
    await originalBuzzWeft.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to Buzz: ${error.message}`)
  }
}
