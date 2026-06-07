export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          id: string
          google_books_id: string
          title: string
          authors: string[]
          cover_url: string | null
          description: string | null
          published_year: number | null
          created_at: string
        }
        Insert: {
          id?: string
          google_books_id: string
          title: string
          authors?: string[]
          cover_url?: string | null
          description?: string | null
          published_year?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          google_books_id?: string
          title?: string
          authors?: string[]
          cover_url?: string | null
          description?: string | null
          published_year?: number | null
          created_at?: string
        }
        Relationships: []
      }
      shelf_entries: {
        Row: {
          id: string
          user_id: string
          book_id: string
          status: 'wishlist' | 'reading' | 'read'
          rating: number | null
          note: string | null
          started_at: string | null
          finished_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          status: 'wishlist' | 'reading' | 'read'
          rating?: number | null
          note?: string | null
          started_at?: string | null
          finished_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          status?: 'wishlist' | 'reading' | 'read'
          rating?: number | null
          note?: string | null
          started_at?: string | null
          finished_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: 'added_wishlist' | 'started_reading' | 'finished_book' | 'wrote_review'
          shelf_entry_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'added_wishlist' | 'started_reading' | 'finished_book' | 'wrote_review'
          shelf_entry_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'added_wishlist' | 'started_reading' | 'finished_book' | 'wrote_review'
          shelf_entry_id?: string
          created_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          user_id: string
          activity_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string
          created_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          user_id: string
          activity_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      shelf_status: 'wishlist' | 'reading' | 'read'
      activity_type: 'added_wishlist' | 'started_reading' | 'finished_book' | 'wrote_review'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
