---
title: Unauthenticated Route Access — Opt-In Blocklist in proxy.ts
date: 2026-06-12
category: docs/solutions/security-issues/
module: sindigo
problem_type: security_issue
component: authentication
symptoms:
  - Unauthenticated users can visit /[username] profile pages and see full reading history
  - Private book notes and reviews visible at /[username]/books/[bookId] without auth
  - Followers and following lists accessible to anonymous visitors
  - /settings page flashes content briefly before client-side redirect fires
  - /search and /find-people routes fully accessible to anonymous users
root_cause: missing_permission
resolution_type: code_fix
severity: critical
tags:
  - auth
  - middleware
  - proxy
  - next-js
  - supabase
  - protected-routes
  - allowlist
  - server-component
---

# Unauthenticated Route Access — Opt-In Blocklist in proxy.ts

## Problem

Multiple app routes — including profile pages with private book notes, followers/following lists, settings, search, and find-people — were publicly accessible to unauthenticated users. The root cause was that `proxy.ts` used an opt-in `PROTECTED_ROUTES` blocklist, meaning only routes explicitly listed were protected. Any route not on the list was implicitly public.

## Symptoms

- Visiting `/sidhartha` or any `/[username]` profile URL while logged out showed the full profile page including reading history, notes, and book reviews
- `/[username]/books/[bookId]` exposed private reading notes and star ratings to anonymous visitors
- `/[username]/followers` and `/[username]/following` had no auth check of any kind — fully public
- `/settings` flashed the settings UI momentarily before a client-side `useEffect` redirect fired; server actions on the page were callable during the window before redirect
- `/search` and `/find-people` were entirely unprotected — no auth check of any form

## What Didn't Work

**Creating `middleware.ts`:** The first instinct was to add a standard Next.js `middleware.ts` file at the project root. This caused an immediate build error:

```
Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
Please use "./proxy.ts" only.
```

Next.js 16 replaces `middleware.ts` with `proxy.ts`. The two files conflict and cannot coexist. All middleware logic must live in `proxy.ts`. The `middleware.ts` file had to be deleted before the build would pass.

**Patching the existing blocklist:** Simply adding the missing routes to `PROTECTED_ROUTES` would have fixed the known gaps, but left the architecture fragile — every future page added would be unprotected by default until someone remembered to add it to the list.

## Solution

### 1. Rewrite `proxy.ts` from opt-in blocklist to opt-out allowlist

**Before (broken) — `proxy.ts`:**

```ts
export const PROTECTED_ROUTES = ['/feed', '/search', '/settings', '/find-people', '/recommendation']

const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
if (isProtected && !user) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

**After (fixed) — `proxy.ts`:**

```ts
// Only these routes skip auth — everything else is protected
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/discover',   // intentionally public — AI recommendation landing
])

const AUTH_ONLY_PATHS = new Set(['/login', '/signup'])

// Auth callbacks and API routes pass through unconditionally
if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
  return supabaseResponse
}

// Redirect logged-in users away from auth pages
if (AUTH_ONLY_PATHS.has(pathname) && user) {
  return NextResponse.redirect(new URL('/feed', request.url))
}

// Block unauthenticated access to everything not explicitly public
if (!PUBLIC_PATHS.has(pathname) && !user) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', pathname)   // preserve intended destination
  return NextResponse.redirect(loginUrl)
}
```

### 2. Add server-side `redirect('/login')` to each page as defence-in-depth

Even with the proxy fixed, each server component now guards itself. A guard that runs in the same process as the data fetch cannot be bypassed by proxy misconfiguration:

```ts
// Pattern applied to: /[username], /[username]/books/[bookId],
// /[username]/followers, /[username]/following, /search
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### 3. Convert client-only pages to server component wrappers

Pages using `'use client'` with a `useEffect`-based auth redirect were rewritten. The auth check moves server-side; the interactive UI becomes a named client component:

**Before — `app/settings/page.tsx` (client component, flash risk):**
```ts
'use client'

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) { router.push('/login'); return }
    // load profile data...
  })
}, [router])
```

**After — `app/settings/page.tsx` (server component):**
```ts
export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('display_name, username, bio, avatar_url')
    .eq('id', user.id).single()

  return (
    <SettingsClient
      initialDisplayName={profile.display_name}
      initialUsername={profile.username}
      initialBio={profile.bio ?? ''}
      initialAvatarUrl={profile.avatar_url}
      userId={user.id}
    />
  )
}
```

**New `app/settings/settings-client.tsx` (named export, receives props):**
```ts
'use client'
export function SettingsClient({ initialDisplayName, initialUsername, initialBio, initialAvatarUrl, userId }: Props) {
  // form UI — only renders after server has confirmed auth
}
```

Same pattern applied to `/find-people` → `find-people-client.tsx`.

### 4. Document the auth contract in `CLAUDE.md`

An "Authentication Rules" section was added covering the `PUBLIC_PATHS` allowlist, a 3-step checklist for new routes, and the server wrapper rule for client components.

## Why This Works

The root cause was an **unsafe default**: the blocklist required developers to remember to protect every new route. Anything not on the list was implicitly public. The allowlist inverts this — anything not on `PUBLIC_PATHS` is implicitly private. New routes are protected by default; making a route public requires an explicit, deliberate act.

The defence-in-depth server-side redirects address a second failure mode: proxy/middleware configuration is infrastructure that can be misconfigured, bypassed in local testing, or have edge cases around dynamic path segments. A `redirect('/login')` inside the server component runs in the same process as the data fetch — it is impossible for protected data to be returned before the auth check runs because the component never reaches its data-fetching code.

Converting `useEffect` redirects to server-side redirects eliminates a race condition: React renders the component and sends HTML to the client, then the effect fires. During that window, the page UI is briefly visible and server actions on the page are callable. Server-side auth eliminates both exposures.

## Prevention

**Always use an allowlist for public routes, never a blocklist for protected routes.** The set of intentionally public routes in any app is small, stable, and deliberate; the set of protected routes grows constantly. Blocklists require perfect recall on every new page added.

**Checklist for every new route in `app/`:**
1. Should this route be public? → Add to `PUBLIC_PATHS` in `proxy.ts` with an inline comment explaining why.
2. Is it a server component? → Add `const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login')` before any data fetch.
3. Is it a `'use client'` component? → Create a server `page.tsx` wrapper that checks auth and passes data as props; move the UI to a `*-client.tsx` named export.

**Never use `useEffect` as the sole auth guard.** Effects run after hydration — the HTML is already sent to the client, and server actions are already callable, before the redirect fires.

**Code review flag:** Any `app/` file with `'use client'` at the top that calls `supabase.auth.getUser()` in a `useEffect` and then `router.push('/login')` should be flagged for the server wrapper pattern.

**Note on Next.js 16:** This project uses Next.js 16 which uses `proxy.ts` instead of `middleware.ts`. These two files conflict — do not create `middleware.ts`. All edge middleware logic lives in `proxy.ts`. (session history)

## Related Issues

- Prior auth gap: `/api/books/search` route was created without auth protection, then deleted in favor of `searchBooksAction` which enforces auth automatically. Pattern: prefer server actions over raw API routes for authenticated operations. (session history)
