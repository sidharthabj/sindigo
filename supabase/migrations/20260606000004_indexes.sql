-- Performance indexes for common query patterns
CREATE INDEX idx_shelf_entries_user_id ON shelf_entries(user_id);
CREATE INDEX idx_activities_user_id    ON activities(user_id);
CREATE INDEX idx_follows_following_id  ON follows(following_id);
CREATE INDEX idx_likes_activity_id     ON likes(activity_id);
CREATE INDEX idx_comments_activity_id  ON comments(activity_id);
