"use client"
import { OrganizationSwitcher, SignOutButton, SignedIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { dark } from '@clerk/themes'

const Topbar = () => {
  const router = useRouter();
  
  return (
    <nav className="topbar">
      <Link href='/' className='flex items-center gap-4'>
        {/* <h2 className="flex text-purple-700 text-heading3-bold">BuzzWeft</h2> */}
        {/* <Image src='/assets/logo.svg' alt='logo' width={28} height={28} /> */}
        <p className="text-heading3-bold text-light-1 max-xs:hidden">BuzzWeft</p>
      </Link>

      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton signOutCallback={() => router.push('/sign-in')}>
               <div className="flex cursor-pointer">
                <Image src='/assets/logout.svg' alt='logout button' height={24} width={24} />
               </div>
            </SignOutButton>
          </SignedIn>
        </div>
        <OrganizationSwitcher 
          appearance={{
            baseTheme: dark,
            elements: {
              organizationSwitcherTrigger: 'py-2 px-4'
            }
          }}
        /> 
      </div>
    </nav>
  )
}

export default Topbar