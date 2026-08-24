export type Database = {
  public: {
    Tables: {
      profiles: {
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          full_name?: string | null;
          id: string;
          language?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
        Row: {
          avatar_url: string | null;
          created_at: string;
          date_of_birth: string | null;
          full_name: string | null;
          id: string;
          language: string;
          phone: string | null;
          updated_at: string;
        };
        Update: {
          avatar_url?: string | null;
          date_of_birth?: string | null;
          full_name?: string | null;
          language?: string;
          phone?: string | null;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
