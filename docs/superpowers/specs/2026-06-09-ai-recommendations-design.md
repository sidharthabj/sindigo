# AI Book Recommendations — Design Spec

**Date:** 2026-06-09
**Status:** Approved

## Overview

Add an AI-powered book recommendation feature to Sindigo. Users provide 2–5 books they love as taste signals; Claude Haiku returns 5 personalized recommendations with cover art and a one-sentence explanation for each match.

The feature lives on two surfaces:
1. **`/discover`** — public page, no login required, linked from the landing page hero
2. **`/recommendation`** — in-app page, auth-required, in the main navigation between "Feed" and "Find People"

Inspired by [mynextbook.io](https://mynextbook.io). Same UX concept, rebuilt to match Sindigo's theme and design system.

---

## Architecture

### Single shared API route

`POST /api/recommend` powers both surfaces. It accepts structured book data, rate-limits the request, calls Claude Haiku, fetches book covers from Google Books, and returns 5 recommendations.

The Anthropic API key lives only in Vercel environment variables — never exposed to the browser.

### New files

```
app/
  discover/
    page.tsx                          # Public recommendation page
  recommendation/
    page.tsx                          # In-app recommendation page (auth-required)
  api/
    recommend/
      route.ts                        # POST handler: rate limit → Claude → Google Books
components/
  recommendations/
    floating-books-bg.tsx             # Animated floating book emojis background
    book-input-search.tsx             # Live Google Books search input + dropdown
    selected-books-list.tsx           # Animated chips of selected books
    recommendation-results.tsx        # Staggered result cards
    shelf-book-picker.tsx             # In-app only: Read shelf selector row
```

### Modified files

- `components/layout/navbar.tsx` — add "Recommendation" link between Feed and Find People
- `components/layout/mobile-menu.tsx` — same addition for mobile
- `components/landing/landing-page.tsx` — add "Try AI Recommendations →" CTA button in hero
- `proxy.ts` — add `/recommendation` to `PROTECTED_ROUTES`

### New environment variables

```
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Upstash Redis is added via the Vercel Marketplace integration (env vars auto-populate).
Anthropic API key comes from [console.anthropic.com](https://console.anthropic.com).

---

## API Route: `POST /api/recommend`

### Request

```typescript
{
  books: Array<{ title: string; author: string }>  // 2–5 items
}
```

### Response

```typescript
{
  recommendations: Array<{
    title: string
    author: string
    reason: string       // one sentence from Claude
    coverUrl: string | null
  }>
}
```

### Request pipeline

1. **Input validation** — 2–5 books, title and author strings max 100 chars each. Reject malformed input with `400`.
2. **Origin check** — reject requests not originating from our domain with `403`. Prevents direct curl/script abuse.
3. **Rate limiting** (Upstash Redis, sliding window):
   - Unauthenticated / public: **5 requests per IP per hour**
   - Authenticated user: **10 requests per user per day**
   - Exceeded limit returns `429 Too Many Requests`.
4. **Prompt construction** — only structured data (title/author) is interpolated into the Claude prompt. No raw user text that could cause prompt injection. Claude is asked to return a JSON array of 5 recommendations with `title`, `author`, and `reason` fields.
5. **Claude Haiku call** — via Anthropic SDK. Model: `claude-haiku-4-5-20251001`. Temperature 0.7 for a balance of creativity and consistency. Required packages: `@anthropic-ai/sdk`, `@upstash/ratelimit`, `@upstash/redis`.
6. **Cover fetching** — 5 parallel Google Books API lookups by `"intitle:{title} inauthor:{author}"`. Best-effort: missing covers degrade gracefully to a placeholder.
7. **Return** merged result.

### Cost estimate

Each call: ~600 input tokens + ~500 output tokens with Haiku pricing ($0.80/M input, $4/M output) ≈ **$0.003 per call** (under half a cent). Set a monthly spending cap in the Anthropic console as an absolute ceiling.

---

## Protection Strategy

| Layer | Mechanism |
|---|---|
| Hard spend cap | Set monthly limit in Anthropic console dashboard |
| Rate limiting | Upstash Redis sliding window (IP + user) |
| Origin check | `Origin` / `Referer` header validation in API route |
| Input validation | Max 5 books, max 100 chars per field, type checking |
| Prompt injection | Only structured `title`/`author` fields sent to Claude, never raw freeform text |
| Key security | `ANTHROPIC_API_KEY` is server-only env var, never in client bundle |

---

## Public Page: `/discover`

### Entry point

The landing page hero gets a third CTA button alongside "Get started" and "Log in":

```
"Try AI Recommendations →"  (outline variant, size lg)
```

Links to `/discover`. No auth required to visit.

### Page design

Matches Sindigo's existing light theme and serif typography — not the dark navy of the reference site.

**Background** — `FloatingBooksBg` component: 8 book emojis (📖 📚 📕 📗 📘 📙 📔 📓) positioned absolutely with `pointer-events: none`. Each has a unique Framer Motion `animate` loop with randomised drift (±30–60px X/Y), gentle rotation (±15°), and opacity pulse (0.15–0.4). Staggered `delay` values prevent synchronised movement.

**Layout:**
```
[Floating books background]

  Headline: "Find your next favourite read"
  Subline:  "Tell us a few books you've loved — we'll find your next obsession."

  [BookInputSearch]       ← live Google Books search + dropdown
  [SelectedBooksList]     ← animated chips, max 5

  [Get recommendations →] ← disabled until ≥2 books selected

  [RecommendationResults] ← appears after API response
```

**No CTA buttons on result cards.** Clean, read-only display. A "Start over" link below the results resets the form.

---

## In-App Page: `/recommendation`

### Navigation

- Desktop navbar: Feed | **Recommendation** | Find People | Add Book | Profile | Settings
- Mobile menu: same order
- Route `/recommendation` added to `PROTECTED_ROUTES` in `proxy.ts`

### Page design

Same Sindigo theme. Same floating books background.

**Input zone — two methods feeding one shared selected list:**

**1. From your shelf**
A horizontally scrollable row of the user's Read shelf books as small cover thumbnails (fetched from their existing `shelf_entries` data — no extra API call). Tapping a cover selects it: ring highlight + checkmark overlay appears. Tapping again deselects.

**2. Search any book**
The same `BookInputSearch` component from the public page. Lets users add books as taste signals even if they haven't tracked them in Sindigo.

Both inputs populate the shared `SelectedBooksList` below. Same 2-book minimum, 5-book maximum, same "Get recommendations →" button.

**Result cards** — same `RecommendationResults` component, but each card has an additional **"Add to Wishlist"** button:
- Calls the existing `addBookToShelf(googleBooksId, 'wishlist')` server action
- Optimistic UI: button immediately transforms to "✓ Added" on click
- If the book already exists on any of the user's shelves: button shows "Already on shelf" (disabled)

---

## Animation System

All animations use Framer Motion (already installed).

### `FloatingBooksBg`
```typescript
// Each emoji gets unique random values for:
animate={{ x: [0, dx, 0], y: [0, dy, 0], rotate: [0, r, 0], opacity: [0.2, o, 0.2] }}
transition={{ duration: 8–14s, repeat: Infinity, delay: stagger }}
```

### `BookInputSearch` dropdown
```typescript
// AnimatePresence wraps the dropdown list
initial={{ opacity: 0, y: -6 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0 }}
// Each item has a 40ms stagger delay
```

### `SelectedBooksList` chips
```typescript
// AnimatePresence + layout prop for smooth reflow
// Add: scale 0.8 → 1, spring stiffness 300
// Remove: scale + opacity → 0
```

### Loading state (button)
While waiting for Claude (~2–4s), the button shows a pulsing shimmer and cycles through messages:
- "Analysing your taste…"
- "Finding patterns…"
- "Almost there…"

### `RecommendationResults` cards
```typescript
initial={{ opacity: 0, y: 24 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.08 }}
// 5 cards cascade in over ~400ms total
```

---

## Constraints & Rules

- The `ANTHROPIC_API_KEY` must never be referenced in any client component or exported from a file that could be bundled for the browser.
- The `/api/recommend` route must not be callable from outside the app's domain (origin check).
- Minimum 2 books required before the "Get recommendations" button is enabled.
- Maximum 5 books as input (UX constraint — also keeps prompt tokens predictable).
- Missing Google Books covers degrade gracefully: show a styled placeholder with the book title, never a broken image.
- The `shelf-book-picker` component is only imported by `/recommendation/page.tsx` — not by the public page.
- Rate limit counters use Upstash Redis with sliding window algorithm. Keys: `ratelimit:ip:{hashedIp}` and `ratelimit:user:{userId}`.
- All new routes follow the existing App Router pattern (Server Components by default, `'use client'` only where interactivity is needed).
