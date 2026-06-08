/**
 * Creates placeholder test accounts for local development.
 * Run with: npx tsx scripts/seed-test-users.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_USERS = [
  {
    email: 'alice.test@sindigo.dev',
    password: 'testpassword123',
    display_name: 'Alice Reads',
    username: 'alicereads',
    bio: 'Fantasy & sci-fi. Always three books deep.',
  },
  {
    email: 'marco.test@sindigo.dev',
    password: 'testpassword123',
    display_name: 'Marco',
    username: 'marcobooks',
    bio: 'Non-fiction only. Working through the classics.',
  },
  {
    email: 'priya.test@sindigo.dev',
    password: 'testpassword123',
    display_name: 'Priya',
    username: 'priyareads',
    bio: null,
  },
]

async function seedUsers() {
  for (const u of TEST_USERS) {
    // Check if user already exists
    const { data: existing } = await admin
      .from('profiles')
      .select('username')
      .eq('username', u.username)
      .single()

    if (existing) {
      console.log(`  skipped  @${u.username} (already exists)`)
      continue
    }

    // Create auth user — the DB trigger auto-creates the profile row
    let userId: string
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    })

    if (error?.message?.includes('already been registered')) {
      // Auth user exists but profile wasn't updated yet — look up by email
      const { data: list } = await admin.auth.admin.listUsers()
      const existing = list?.users.find(usr => usr.email === u.email)
      if (!existing) { console.error(`  failed   @${u.username}: could not find existing user`); continue }
      userId = existing.id
    } else if (error || !data.user) {
      console.error(`  failed   @${u.username}: ${error?.message}`)
      continue
    } else {
      userId = data.user.id
    }

    // Update the auto-generated profile with real display name / bio
    await admin
      .from('profiles')
      .update({ display_name: u.display_name, username: u.username, bio: u.bio })
      .eq('id', userId)

    console.log(`  created  @${u.username} (${u.email})`)
  }
}

seedUsers()
  .then(() => console.log('\nDone.'))
  .catch(err => { console.error(err); process.exit(1) })
