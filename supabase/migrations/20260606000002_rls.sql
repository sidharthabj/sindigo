ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE books        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelf_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments     ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_public_read"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Books (public catalog, any authed user can insert)
CREATE POLICY "books_public_read"       ON books FOR SELECT USING (true);
CREATE POLICY "books_authed_insert"     ON books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Shelf entries (public read, owner manages)
CREATE POLICY "shelf_public_read"   ON shelf_entries FOR SELECT USING (true);
CREATE POLICY "shelf_owner_insert"  ON shelf_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shelf_owner_update"  ON shelf_entries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shelf_owner_delete"  ON shelf_entries FOR DELETE USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "follows_public_read"  ON follows FOR SELECT USING (true);
CREATE POLICY "follows_owner_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_owner_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Activities
CREATE POLICY "activities_public_read"  ON activities FOR SELECT USING (true);
CREATE POLICY "activities_owner_insert" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Likes
CREATE POLICY "likes_public_read"  ON likes FOR SELECT USING (true);
CREATE POLICY "likes_owner_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_owner_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_public_read"  ON comments FOR SELECT USING (true);
CREATE POLICY "comments_owner_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_owner_delete" ON comments FOR DELETE USING (auth.uid() = user_id);
