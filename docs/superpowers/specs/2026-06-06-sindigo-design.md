# Sindigo — Design Spec

**Date:** 2026-06-06
**Status:** Approved

## Overview

Sindigo is a social reading tracker. Users maintain three shelves — Wishlist, Currently Reading, and Read — and write reviews with a rating out of 5 (displayed as book icons). Profiles are public. Users follow each other and see an activity feed of reading events from people they follow. There are no algorithmic recommendations; users add every book themselves.

---

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router | Server Components, API routes, Vercel-native |
| Database + Auth | Supabase | PostgreSQL + OAuth in one platform, generous free tier |
| DB client | Supabase TypeScript client (generated types) | Unified with Supabase auth; avoids Prisma/auth schema conflicts |
| Book data | Google Books API | Free (1,000 req/day), rich metadata, cover art, requires API key |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Hosting | Vercel | One-command deploys, preview URLs, Supabase Marketplace integration |

**Supabase free tier notes:**
- 500 MB database, 50,000 monthly active users, unlimited API requests
- Projects pause after 1 week of inactivity — acceptable during early development; won't occur once the app has regular traffic

---

## Data Model

### `profiles`
Extends Supabase `auth.users`. Created automatically on first sign-in via a database trigger.

```
id            uuid (references auth.users)
username      text (unique, URL-safe)
display_name  text
bio           text (nullable)
avatar_url    text (nullable)
created_at    timestamptz
```

Reserved usernames (cannot be registered): `feed`, `search`, `settings`, `login`, `signup`

### `books`
Canonical shared book records. Populated from Google Books on first add by any user.

```
id               uuid (primary key)
google_books_id  text (unique)
title            text
authors          text[]
cover_url        text (nullable)
description      text (nullable)
published_year   integer (nullable)
created_at       timestamptz
```

### `shelf_entries`
A user's relationship to a book. One row per user per book — updated in place as status changes.

```
id           uuid (primary key)
user_id      uuid (references profiles)
book_id      uuid (references books)
status       enum: 'wishlist' | 'reading' | 'read'
rating       integer 1–5 (nullable, only set when status = 'read')
review       text (nullable)
started_at   timestamptz (nullable, set when status becomes 'reading')
finished_at  timestamptz (nullable, set when status becomes 'read')
created_at   timestamptz
updated_at   timestamptz

UNIQUE (user_id, book_id)
```

### `follows`
Social graph. All follows are instant — no approval required.

```
follower_id   uuid (references profiles)
following_id  uuid (references profiles)
created_at    timestamptz

PRIMARY KEY (follower_id, following_id)
```

### `activities`
Feed events generated automatically when shelf entries are created or status changes.

```
id             uuid (primary key)
user_id        uuid (references profiles)
activity_type  enum: 'added_wishlist' | 'started_reading' | 'finished_book' | 'wrote_review'
shelf_entry_id uuid (references shelf_entries)
created_at     timestamptz
```

Activity generation rules:
- Shelf entry created with `status = 'wishlist'` → `added_wishlist`
- Status changes to `'reading'` → `started_reading`
- Status changes to `'read'` → `finished_book`
- Review text is saved on a `'read'` entry → `wrote_review` (separate event from `finished_book`)

If the user writes a review at the same time they mark a book as Read, only `finished_book` is emitted (not both). `wrote_review` is only emitted when a review is added or updated after the book was already marked Read.

### `likes`
On activity feed items.

```
id           uuid (primary key)
user_id      uuid (references profiles)
activity_id  uuid (references activities)
created_at   timestamptz

UNIQUE (user_id, activity_id)
```

### `comments`
On activity feed items.

```
id           uuid (primary key)
user_id      uuid (references profiles)
activity_id  uuid (references activities)
content      text
created_at   timestamptz
```

---

## Pages & Routes

### Public (no auth required)
| Route | Description |
|---|---|
| `/` | Landing page for logged-out visitors — app description, sign up / sign in CTAs |
| `/[username]` | User profile — currently reading, read shelf, wishlist, follower/following counts |
| `/[username]/followers` | List of this user's followers |
| `/[username]/following` | List of who this user follows |
| `/login` | Sign in (Supabase Auth UI) |
| `/signup` | Create account (Supabase Auth UI) |

### Authenticated
| Route | Description |
|---|---|
| `/feed` | Activity feed from followed users, paginated |
| `/search` | Search Google Books to add a book to a shelf |
| `/settings` | Edit profile (display name, bio, avatar) |

Unauthenticated visitors who attempt to access `/feed`, `/search`, or `/settings` are redirected to `/login`.

---

## Features

### Shelf Management

Users have three shelves: **Wishlist**, **Currently Reading**, and **Read**.

**Adding a book:**
1. User clicks "Add book" from any shelf or profile page.
2. A modal opens with a search input.
3. Query is sent to Google Books API; results show cover, title, author.
4. User selects a result and chooses which shelf to add it to.
5. If no Google Books result is found, a manual entry form appears as fallback (title + author required; cover optional via URL).
6. A `books` row is created if the `google_books_id` doesn't already exist; a `shelf_entry` row is created for the user.

**Moving between shelves:**
- Wishlist → Currently Reading: sets `status = 'reading'`, `started_at = now()`
- Currently Reading → Read: sets `status = 'read'`, `finished_at = now()`, prompts for rating (required) and review (optional)
- Users can also move a book directly from Wishlist → Read
- Moving backwards (e.g., Read → Currently Reading) is allowed; clears `finished_at` and `rating`

**Rating:**
- Integer 1–5, displayed as filled/empty book icons (not stars)
- Required when marking a book as Read
- Can be edited after the fact from the Read shelf

### Profile Page (`/[username]`)

Three sections rendered in order:

1. **Currently Reading** — a horizontal row of book covers with title/author. Multiple books shown simultaneously.
2. **Read** — a grid or list of books with rating (book icons) and review excerpt. Full review expands inline.
3. **Wishlist** — a list of books the user wants to read, no ratings.

Header shows: avatar, display name, username, bio, follower count, following count, and a Follow/Unfollow button (visible to authenticated users who are not the profile owner).

Own profile shows an Edit Profile link instead of Follow/Unfollow.

### Activity Feed (`/feed`)

- Reverse-chronological stream of events from followed users
- Activity card shows: avatar + username, event description, book cover + title, timestamp
- For `wrote_review` events: shows rating (book icons) + review excerpt with "read more" expansion
- **Likes:** toggle button on each card; shows like count
- **Comments:** expandable inline thread below each card; text input to add a comment
- **Pagination:** "Load more" button at the bottom — no infinite scroll
- Feed is empty state if you follow nobody, with a prompt to find people

### Search & Add Flow

Triggered from "Add book" button. Uses Google Books API:
- Endpoint: `https://www.googleapis.com/books/v1/volumes?q={query}&key={API_KEY}`
- Display fields: `volumeInfo.title`, `volumeInfo.authors`, `volumeInfo.imageLinks.thumbnail`, `volumeInfo.publishedDate`, `volumeInfo.description`
- Fallback: manual entry form if no results or user can't find their book

### Follow System

- Follow/Unfollow is a single button on any profile page
- Follows are instant — no approval, no notifications in v1
- Follower/following counts shown on profile, linked to `/[username]/followers` and `/[username]/following`

### Authentication

Handled by Supabase Auth:
- Email + password
- Google OAuth
- On first sign-in, a database trigger creates a `profiles` row with a default username derived from the email (user can update in `/settings`)

---

## Out of Scope (v1)

- Algorithmic recommendations
- Book detail page (community-wide reviews for a single book)
- Notifications (follows, likes, comments)
- Direct messaging
- Reading challenges or goals
- Real-time feed updates (polling-based is sufficient)
- Mobile app
