# Sindigo

A social reading tracker. Keep tabs on what you want to read, what you're reading, and what you've finished — then share it with friends.

## Features

- **Three shelves:** Wishlist, Currently Reading, and Read
- **Notes & reviews:** Add thoughts at any stage — "Why I want to read this," "My thoughts so far," or a full review
- **Ratings:** Rate books 1–5, displayed as book icons
- **Social:** Follow friends and see their reading activity in a feed

## Tech Stack

- [Next.js 15](https://nextjs.org) App Router
- [Supabase](https://supabase.com) for database and auth
- [shadcn/ui](https://ui.shadcn.com) components
- [Framer Motion](https://www.framer.com/motion) for animations
- [Google Books API](https://developers.google.com/books) for book data

## Getting Started

Copy `.env.local.example` to `.env.local` and fill in your environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_BOOKS_API_KEY=
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
