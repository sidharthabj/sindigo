import { createClient, getUser } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const [supabase, user] = await Promise.all([createClient(), getUser()])
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id, display_name').eq('username', username).single()
  if (!profile) notFound()

  const { data: follows } = await supabase
    .from('follows')
    .select('follower:profiles!follower_id(id, username, display_name, avatar_url)')
    .eq('following_id', profile.id)

  const followers = (follows ?? []).map(f => f.follower as any)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">People following @{username}</h1>
      <ul className="space-y-4">
        {followers.map((p: any) => (
          <li key={p.id}>
            <Link href={`/${p.username}`} className="flex items-center gap-3 hover:opacity-80">
              <Avatar className="w-10 h-10">
                <AvatarImage src={p.avatar_url ?? undefined} />
                <AvatarFallback>{p.display_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{p.display_name}</p>
                <p className="text-sm text-muted-foreground">@{p.username}</p>
              </div>
            </Link>
          </li>
        ))}
        {followers.length === 0 && <p className="text-muted-foreground">No followers yet.</p>}
      </ul>
    </div>
  )
}
