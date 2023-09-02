"use server";
import { revalidatePath } from "next/cache";
import BuzzWeft from "../models/buzzWeft.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Community from "../models/community.model";

interface Props {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createBuzz({ text, author, communityId, path }: Props) {
  try {
    connectToDB();
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdBuzz = await BuzzWeft.create({
      text,
      author,
      community: communityId,
    });
    // update user model
    await User.findByIdAndUpdate(author, {
      $push: { buzzWefts: createdBuzz._id },
    });

    if(communityIdObject) {
      // update community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { buzzWefts: createdBuzz._id },
      });
    }
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating buzz: ${error.message}`);
  }
}

async function fetchAllChildBuzzWefts(buzzWeftId: string): Promise<any[]> {
  const childBuzzWefts = await BuzzWeft.find({ parentId: buzzWeftId });
  const descendantBuzzWefts = [];
  for (const childBuzzWeft of childBuzzWefts) {
    const descendants = await fetchAllChildBuzzWefts(childBuzzWeft._id);
    descendantBuzzWefts.push(childBuzzWeft, ...descendants);
  }

  return descendantBuzzWefts;
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
    .populate({ 
      path: "author", 
      model: User 
    })
    .populate({
      path: "community",
      model: Community,
    })
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

export async function deleteBuzzWeft(id: string, path: string): Promise<void> {
 try {
  connectToDB();
  // find  the buzz to be deleted  (the main buzz)
  const mainBuzWeft = await BuzzWeft.findById(id).populate(" author community");

  if(!mainBuzWeft) {
    throw new Error(`Buzz not found`);
  }

  // Fetch all child buzzes  and their descendant recursively
  const descendantBuzzWefts = await fetchAllChildBuzzWefts(id);

  // Get all descendant buzz IDS include=ing the main buzz ID and child buzz IDs
  const descendantBuzzWeftIds = [
    id,
    ...descendantBuzzWefts.map((buzzWeft) => buzzWeft._id),
  ];

  // Extract the authorIds and communityIds to update User and Community model respectively
  const uniqueAuthorIds = new Set(
    [
      ...descendantBuzzWefts.map((buzzWeft) => buzzWeft.author?._id?.toString()), //Use optional chaining to handle possible undefined values
      mainBuzWeft.author?._id?.toString(),
    ].filter((id) => id !== undefined)
  );

  const uniqueCommunityIds = new Set(
    [
      ...descendantBuzzWefts.map((buzzWeft) => buzzWeft.community?._id.toString()), // Use optional chaining to  handlepossible undefined values 
      mainBuzWeft.community?._id?.toString(),
    ].filter((id) => id !== undefined)
  )

  //Recursively delete child buzzz and  their descendants
  await BuzzWeft.deleteMany({ _id: { $in: 
  descendantBuzzWeftIds } } );
  // Update User Model
  await User.updateMany(
    { _id: { $in: Array.from(uniqueAuthorIds) } },
    { $push: { buzzWefts: { $in: 
    descendantBuzzWeftIds } } }
  );

  // Update Community model
  await Community.updateMany(
    { _id: { $in: Array.from(uniqueCommunityIds ) } },
    { $pull: { buzzWefts: { $in: 
    descendantBuzzWeftIds } } }
  );

  revalidatePath(path);
 } catch (error: any) {
  throw new Error(`Failed to delete Buzz; ${error.message}`);
 }
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
      }) // populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the Community field with _id and name
      .populate({
        path: 'children', //Populate the children field
        populate: [
          {
            path: 'author', // Populate the author field within children
            model: User,
            select: " _id id name parentId image", // Select only _id nad  username field of th author
          },
          {
            path: 'children', // Populate the children field within children
            model: BuzzWeft, // The model of the nested children (assuming it's the same "BuzzWeft" model)
            populate: {
              path: 'author', // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
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
      parentId: buzzWeftId, // Set the parentId to the original BuzzWeft'd ID
    })

    // save the comment buzzWeft to the database
    const saveCommentBuzzWeft = await commentBuzzWeft.save();

    // Add the comment Buzz's ID to thr original buzzWeft's children array
    originalBuzzWeft.children.push(saveCommentBuzzWeft._id);

    // save the updated original BuzzWeft to the database
    await originalBuzzWeft.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to Buzz: ${error.message}`)
  }
}
