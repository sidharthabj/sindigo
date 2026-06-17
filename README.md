# Sindigo

A social reading tracker. Keep tabs on what you want to read, what you're reading, and what you've finished — then share it with friends.

## Features

- **Three shelves:** Wishlist, Currently Reading, and Read
- **Notes & reviews:** Add thoughts at any stage — "Why I want to read this," "My thoughts so far," or a full review
- **Ratings:** Rate books 1–5, displayed as book icons
- **Social:** Follow friends and see their reading activity in a feed
- **AI book recommendations:** Enter 2–5 books you love and get 5 personalised picks — powered by Claude, free, and no login required

## Tech Stack

- [Next.js 15](https://nextjs.org) App Router
- [Supabase](https://supabase.com) for database and auth
- [shadcn/ui](https://ui.shadcn.com) components
- [Framer Motion](https://www.framer.com/motion) for animations
- [Google Books API](https://developers.google.com/books) for book data and cover art
- [Claude Haiku 4.5](https://anthropic.com) (via Anthropic SDK) — AI model powering the `/discover` recommendation engine
- [Upstash Redis](https://upstash.com) — serverless rate limiting for the recommendation API (5 req/hr for guests, 10/day for signed-in users)

## Getting Started

Copy `.env.local.example` to `.env.local` and fill in your environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_BOOKS_API_KEY=
ANTHROPIC_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
