import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers } from "@/lib/action/user.action";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";
    
const page = async () => {
    const user = await currentUser(); 
    if(!user) return null;

    const userInfo = await fetchUser(user.id);

    if(!userInfo?.onboarded) redirect('/onboarding');

    // fetch user
    const result = await fetchUsers({
      userId: user.id,
      searchString: '',
      pageNumber: 1,
      pageSize: 25,
    })
  return (
    <section>
        <h1 className="head-text mb-10">Search</h1>

        {/* searchbar */}

        <div className="mt-14 flex flex-col gap-9">
          {result.users.length === 0 ? (
            <p className="no-result">No Users</p>
          ) : (
            <>
              {result.users.map((person) => (
                <UserCard 
                  key={person.id}
                  id={person.id}
                  username={person.username}
                  name={person.name}
                  imgUrl={person.image}
                  personType= 'User'
                />
              ))}
            </>
          )}
        </div>
    </section>
  )
}

export default page