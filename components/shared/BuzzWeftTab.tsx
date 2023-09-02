import { fetchUserPosts } from "@/lib/action/user.action"
import { redirect } from "next/navigation";
import BuzzWeftCard from "../cards/BuzzWeftCard";
import { fetchCommunityPosts } from "@/lib/action/community.action";

interface Props {
  currentUserId: string,
  accountId: string,
  accountType: string,
}

const BuzzWeftTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result: any;

  if(accountType === 'Community') {
    result = await fetchCommunityPosts(accountId)
  } else {
    result = await fetchUserPosts(accountId)
  }

  if (!result) redirect('/');
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.buzzWefts.map((buzz: any) => (
        <BuzzWeftCard
          key={buzz._id}
          id={buzz._id}
          currentUserId={currentUserId}
          parentId={buzz.parentId}
          content={buzz.text}
          author={
            accountType === 'User' ? { name: result.name, image: result.image, id: result.id } : { name: buzz.author.name, image: buzz.author.image, id: buzz.author.id }
          } // todo
          community={buzz.community} // todo
          createdAt={buzz.createdAt}
          comments={buzz.children}
        />
      ))}
    </section>
  )
}

export default BuzzWeftTab