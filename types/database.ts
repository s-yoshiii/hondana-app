export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string | null;
          isbn: string | null;
          cover_image_url: string | null;
          publisher: string | null;
          published_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author?: string | null;
          isbn?: string | null;
          cover_image_url?: string | null;
          publisher?: string | null;
          published_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string | null;
          isbn?: string | null;
          cover_image_url?: string | null;
          publisher?: string | null;
          published_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_books: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          status: "want_to_read" | "reading" | "completed" | "stacked";
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          status: "want_to_read" | "reading" | "completed" | "stacked";
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          status?: "want_to_read" | "reading" | "completed" | "stacked";
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_books_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_books_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          user_book_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_book_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_book_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_user_book_id_fkey";
            columns: ["user_book_id"];
            isOneToOne: true;
            referencedRelation: "user_books";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
