import BuzzWeftCard from "@/components/cards/BuzzWeftCard"
import Comment from "@/components/forms/Comment";
import { fetchBuzzWeftById } from "@/lib/action/buzz.action";
import { fetchUser } from "@/lib/action/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";


const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  const buzzWeft = await fetchBuzzWeftById(params.id);

  return (
    <section className="relative">
      <div className="">
        <BuzzWeftCard
          key={buzzWeft._id}
          id={buzzWeft._id}
          currentUserId={user?.id || ""}
          parentId={buzzWeft.parentId}
          content={buzzWeft.text}
          author={buzzWeft.author}
          community={buzzWeft.community}
          createdAt={buzzWeft.createdAt}
          comments={buzzWeft.children}
        />
      </div>
      <div className="mt-7">
        <Comment
          buzzWeftId={buzzWeft.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>
      <div className="mt-10">
        {buzzWeft.children.map((childItem: any) => (
          <BuzzWeftCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={childItem?.id || ""}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  )
}

export default Page