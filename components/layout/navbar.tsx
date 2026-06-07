import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between">
      <Link href={user ? '/feed' : '/'} className="font-bold text-lg tracking-tight">
        Sindigo
      </Link>
      <div className="flex gap-2">
        {user ? (
          <>
            <Link href="/feed" className={cn(buttonVariants({ variant: 'ghost' }))}>Feed</Link>
            <Link href="/search" className={cn(buttonVariants({ variant: 'ghost' }))}>Add Book</Link>
            <Link href="/settings" className={cn(buttonVariants({ variant: 'ghost' }))}>Settings</Link>
          </>
        ) : (
          <>
            <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>Log in</Link>
            <Link href="/signup" className={cn(buttonVariants({ variant: 'default' }))}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
