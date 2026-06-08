-- Add followed_user to activity_type enum
ALTER TYPE activity_type ADD VALUE 'followed_user';

-- Make shelf_entry_id nullable (follow activities have no shelf entry)
ALTER TABLE activities ALTER COLUMN shelf_entry_id DROP NOT NULL;

-- Add followed_user_id column for follow activities
ALTER TABLE activities
  ADD COLUMN followed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
