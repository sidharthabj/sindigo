-- Enums
CREATE TYPE shelf_status AS ENUM ('wishlist', 'reading', 'read');
CREATE TYPE activity_type AS ENUM ('added_wishlist', 'started_reading', 'finished_book', 'wrote_review');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio          TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Canonical book records (shared across users)
CREATE TABLE books (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_books_id TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  authors         TEXT[] NOT NULL DEFAULT '{}',
  cover_url       TEXT,
  description     TEXT,
  published_year  INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- One shelf entry per user per book
CREATE TABLE shelf_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id     UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  status      shelf_status NOT NULL,
  rating      INTEGER CHECK (rating >= 1 AND rating <= 5),
  note        TEXT,
  started_at  TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- Social graph
CREATE TABLE follows (
  follower_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Activity feed events
CREATE TABLE activities (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type  activity_type NOT NULL,
  shelf_entry_id UUID REFERENCES shelf_entries(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Likes on activities
CREATE TABLE likes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, activity_id)
);

-- Comments on activities
CREATE TABLE comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shelf_entries_updated_at
  BEFORE UPDATE ON shelf_entries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
