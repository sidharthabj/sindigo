import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Book = Database['public']['Tables']['books']['Row']
export type ShelfEntry = Database['public']['Tables']['shelf_entries']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export type ShelfStatus = Database['public']['Enums']['shelf_status']
export type ActivityType = Database['public']['Enums']['activity_type']

export type ShelfEntryWithBook = ShelfEntry & { book: Book }

export type CommentWithProfile = Comment & {
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
}

export type ActivityWithDetails = Activity & {
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
  shelf_entry: ShelfEntryWithBook | null
  followed_user: Pick<Profile, 'username' | 'display_name' | 'avatar_url'> | null
  like_count: number
  user_has_liked: boolean
  comments: CommentWithProfile[]
}
