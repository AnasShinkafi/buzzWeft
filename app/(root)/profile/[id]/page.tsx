import BuzzWeftTab from "@/components/shared/BuzzWeftTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import { fetchUser } from "@/lib/action/user.action";
import { currentUser } from "@clerk/nextjs"
import Image from "next/image";
import { redirect } from "next/navigation";

async function Page({ params }: { params: { id: string}}) {
    const user = await currentUser();

    if(!user) return null;

    const userInfo = await fetchUser(params.id);

    if(!userInfo?.onboarded) redirect('/onboarding')
  return (
    <section className=""> 
        <ProfileHeader 
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.imgUrl} 
        bio={""}        />

        <div className="mt-7">
          <Tabs defaultValue="buzzWefts" className="w-full">
            <TabsList className="tab">
              {profileTabs.map((tab) => (
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
                      {userInfo?.buzzWefts?.length}
                    </p>
                  )}
                </TabsTrigger> 
              ))}
            </TabsList>
            {profileTabs.map((tab) => (
              <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
                <BuzzWeftTab 
                  currentUserId={user.id}
                  accountId={userInfo.id}
                  accountType="User"
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
    </section>
  )
}

export default Page