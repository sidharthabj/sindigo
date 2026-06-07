import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

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
            <Link href="/feed"><Button variant="ghost">Feed</Button></Link>
            <Link href="/search"><Button variant="ghost">Add Book</Button></Link>
            <Link href="/settings"><Button variant="ghost">Settings</Button></Link>
          </>
        ) : (
          <>
            <Link href="/login"><Button variant="ghost">Log in</Button></Link>
            <Link href="/signup"><Button>Sign up</Button></Link>
          </>
        )}
      </div>
    </nav>
  )
}
