import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MobileMenu } from './mobile-menu'

export async function Navbar() {
  const user = await getUser()

  let username: string | null = null
  if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? null
  }

  return (
    <nav className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between relative backdrop-blur-md bg-background/80">
      <Link href={user ? '/feed' : '/'} className="font-bold text-lg tracking-tight">
        Sindigo
      </Link>
      {user ? (
        <>
          <div className="hidden sm:flex gap-2">
            <Link href="/feed" className={cn(buttonVariants({ variant: 'ghost' }))}>Feed</Link>
            <Link href="/recommendation" className={cn(buttonVariants({ variant: 'ghost' }))}>Recommendation</Link>
            <Link href="/find-people" className={cn(buttonVariants({ variant: 'ghost' }))}>Find People</Link>
            <Link href="/search" className={cn(buttonVariants({ variant: 'ghost' }))}>Add Book</Link>
            {username && (
              <Link href={`/${username}`} className={cn(buttonVariants({ variant: 'ghost' }))}>Profile</Link>
            )}
            <Link href="/settings" className={cn(buttonVariants({ variant: 'ghost' }))}>Settings</Link>
          </div>
          <MobileMenu username={username} />
        </>
      ) : (
        <div className="flex gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>Log in</Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: 'default' }))}>Sign up</Link>
        </div>
      )}
    </nav>
  )
}
