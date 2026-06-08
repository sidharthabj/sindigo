import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  return (
    <div className="max-w-2xl mx-auto px-4 text-center flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Sindigo</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Track what you read. Share what you love.
        <br />
        Your personal bookshelf, made social.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>Get started</Link>
        <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>Log in</Link>
      </div>
    </div>
  )
}
