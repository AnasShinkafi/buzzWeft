import PostBuzzWeft from "@/components/forms/PostBuzzWeft";
import { fetchUser } from "@/lib/action/user.action";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";

async function Page() {
    const user = await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/onboarding')
  return (
    <>
      <h1 className="head-text">Create Thread</h1>

      <PostBuzzWeft userId={userInfo._id} />
    </>
  )
}

export default Page