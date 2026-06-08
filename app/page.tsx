import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/feed')

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Sindigo</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Track what you read. Share what you love.
        <br />
        Your personal bookshelf, made social.
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild size="lg"><Link href="/signup">Get started</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/login">Log in</Link></Button>
      </div>
    </div>
  )
}
