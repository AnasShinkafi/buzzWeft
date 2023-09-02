import UserCard from "@/components/cards/UserCard";
import BuzzWeftTab from "@/components/shared/BuzzWeftTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { communityTabs } from "@/constants";
import { fetchCommunityDetails } from "@/lib/action/community.action";
import { currentUser } from "@clerk/nextjs"
import Image from "next/image";

async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();

    if (!user) return null;

    const communityDetails = await fetchCommunityDetails(params.id)

    return (
        <section className="">
            <ProfileHeader
                accountId={communityDetails.id}
                authUserId={user.id}
                name={communityDetails.name}
                username={communityDetails.username}
                imgUrl={communityDetails.imgUrl}
                bio={communityDetails.bio}
                type="Community"
            />

            <div className="mt-7">
                <Tabs defaultValue="buzzWefts" className="w-full">
                    <TabsList className="tab">
                        {communityTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value}>
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                                <p className="max-sm:hidden">{tab.label}</p>

                                {tab.label === 'BuzzWeft' && (
                                    <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                                        {communityDetails?.buzzWefts?.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                        <TabsContent value="buzzWefts" className="w-full text-light-1">
                            <BuzzWeftTab
                                currentUserId={user.id}
                                accountId={communityDetails._id}
                                accountType="Community"
                            />
                        </TabsContent>
                        <section className="mt-9 flex flex-col gap-10">
                            {communityDetails?.members.map((member: any) => (
                                <UserCard 
                                    key={member.id}
                                    id={member.id}
                                    name={member.name}
                                    username={member.username}
                                    imgUrl={member.image}
                                    personType="User"
                                />
                            ))}
                        </section>
                        <TabsContent value="requests" className="w-full text-light-1">
                            <BuzzWeftTab
                                currentUserId={user.id}
                                accountId={communityDetails._id}
                                accountType="Community"
                            />
                        </TabsContent>
                </Tabs>
            </div>
        </section>
    )
}

export default Page 