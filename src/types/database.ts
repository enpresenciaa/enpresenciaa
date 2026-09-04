type Relationship = {
  columns: string[];
  foreignKeyName: string;
  isOneToOne: boolean;
  referencedColumns: string[];
  referencedRelation: string;
};

export type Database = {
  public: {
    Tables: {
      billing_checkout_attempts: {
        Insert: { attempt_id: string; created_at?: string; expires_at?: string | null; status?: string; stripe_checkout_session_id?: string | null; updated_at?: string; user_id: string };
        Relationships: Relationship[];
        Row: { attempt_id: string; created_at: string; expires_at: string | null; status: string; stripe_checkout_session_id: string | null; updated_at: string; user_id: string };
        Update: { expires_at?: string | null; status?: string; stripe_checkout_session_id?: string | null; updated_at?: string };
      };
      billing_customers: {
        Insert: { created_at?: string; provider?: string; stripe_customer_id: string; updated_at?: string; user_id: string };
        Relationships: Relationship[];
        Row: { created_at: string; provider: string; stripe_customer_id: string; updated_at: string; user_id: string };
        Update: { stripe_customer_id?: string; updated_at?: string };
      };
      billing_subscriptions: {
        Insert: { cancel_at_period_end?: boolean; canceled_at?: string | null; created_at?: string; current_period_end?: string | null; current_period_start?: string | null; ended_at?: string | null; id?: string; last_stripe_event_created_at: number; provider?: string; status: string; stripe_price_id: string; stripe_subscription_id: string; updated_at?: string; user_id: string };
        Relationships: Relationship[];
        Row: { cancel_at_period_end: boolean; canceled_at: string | null; created_at: string; current_period_end: string | null; current_period_start: string | null; ended_at: string | null; id: string; last_stripe_event_created_at: number; provider: string; status: string; stripe_price_id: string; stripe_subscription_id: string; updated_at: string; user_id: string };
        Update: never;
      };
      completion_reflections: {
        Insert: { completion_id: string; created_at?: string; reflection_text: string; updated_at?: string };
        Relationships: Relationship[];
        Row: { completion_id: string; created_at: string; reflection_text: string; updated_at: string };
        Update: { reflection_text?: string; updated_at?: string };
      };
      exercise_completions: {
        Insert: { advances_journey?: boolean; business_date: string; completed_at?: string; created_at?: string; duration_seconds?: number | null; emotional_score?: number | null; exercise_id: string; id?: string; idempotency_key: string; repetition_number: number; user_id: string };
        Relationships: Relationship[];
        Row: { advances_journey: boolean; business_date: string; completed_at: string; created_at: string; duration_seconds: number | null; emotional_score: number | null; exercise_id: string; id: string; idempotency_key: string; repetition_number: number; user_id: string };
        Update: never;
      };
      exercise_contents: {
        Insert: { created_at?: string; exercise_id: string; id?: string; locale?: string; mime_type?: string | null; modality: string; publication_status?: string; storage_path?: string | null; text_content?: string | null; updated_at?: string };
        Relationships: Relationship[];
        Row: { created_at: string; exercise_id: string; id: string; locale: string; mime_type: string | null; modality: string; publication_status: string; storage_path: string | null; text_content: string | null; updated_at: string };
        Update: { exercise_id?: string; locale?: string; mime_type?: string | null; modality?: string; publication_status?: string; storage_path?: string | null; text_content?: string | null; updated_at?: string };
      };
      exercise_progress: {
        Insert: { created_at?: string; exercise_id: string; last_activity_at?: string; progress_percentage?: number; updated_at?: string; user_id: string };
        Relationships: Relationship[];
        Row: { created_at: string; exercise_id: string; last_activity_at: string; progress_percentage: number; updated_at: string; user_id: string };
        Update: { last_activity_at?: string; progress_percentage?: number; updated_at?: string };
      };
      exercises: {
        Insert: { content_type?: string | null; created_at?: string; description?: string | null; estimated_duration_minutes?: number | null; id?: string; level_id: string; name: string; position?: number | null; publication_status?: string; updated_at?: string };
        Relationships: Relationship[];
        Row: { content_type: string | null; created_at: string; description: string | null; estimated_duration_minutes: number | null; id: string; level_id: string; name: string; position: number | null; publication_status: string; updated_at: string };
        Update: { content_type?: string | null; description?: string | null; estimated_duration_minutes?: number | null; level_id?: string; name?: string; position?: number | null; publication_status?: string; updated_at?: string };
      };
      levels: {
        Insert: { created_at?: string; description?: string | null; id?: string; is_premium?: boolean; name: string; number: number; publication_status?: string; updated_at?: string };
        Relationships: Relationship[];
        Row: { created_at: string; description: string | null; id: string; is_premium: boolean; name: string; number: number; publication_status: string; updated_at: string };
        Update: { description?: string | null; is_premium?: boolean; name?: string; number?: number; publication_status?: string; updated_at?: string };
      };
      profiles: {
        Insert: { avatar_url?: string | null; created_at?: string; date_of_birth?: string | null; full_name?: string | null; id: string; language?: string; phone?: string | null; updated_at?: string };
        Relationships: Relationship[];
        Row: { avatar_url: string | null; created_at: string; date_of_birth: string | null; full_name: string | null; id: string; language: string; phone: string | null; updated_at: string };
        Update: { avatar_url?: string | null; date_of_birth?: string | null; full_name?: string | null; language?: string; phone?: string | null };
      };
      stripe_webhook_events: {
        Insert: { error_code?: string | null; event_type: string; processed_at?: string | null; processing_status?: string; received_at?: string; stripe_created_at: number; stripe_event_id: string; updated_at?: string };
        Relationships: Relationship[];
        Row: { error_code: string | null; event_type: string; processed_at: string | null; processing_status: string; received_at: string; stripe_created_at: number; stripe_event_id: string; updated_at: string };
        Update: { error_code?: string | null; processed_at?: string | null; processing_status?: string; updated_at?: string };
      };
      user_favorites: {
        Insert: { created_at?: string; exercise_id: string; user_id: string };
        Relationships: Relationship[];
        Row: { created_at: string; exercise_id: string; user_id: string };
        Update: never;
      };
    };
    Views: {
      journal_entries: {
        Relationships: Relationship[];
        Row: { activity_at: string | null; completed_at: string | null; content_type: string | null; duration_seconds: number | null; emotional_score: number | null; entry_id: string | null; exercise_name: string | null; level_name: string | null; progress_percentage: number | null; repetition_number: number | null; user_id: string | null };
      };
    };
    Functions: {
      claim_stripe_webhook_event: {
        Args: { p_event_type: string; p_stripe_created_at: number; p_stripe_event_id: string };
        Returns: boolean;
      };
      complete_exercise: {
        Args: { p_duration_seconds?: number; p_emotional_score?: number; p_exercise_id: string; p_idempotency_key: string; p_reflection_text?: string };
        Returns: Database["public"]["Tables"]["exercise_completions"]["Row"];
      };
      sync_stripe_subscription: {
        Args: { p_cancel_at_period_end: boolean; p_canceled_at: string | null; p_current_period_end: string | null; p_current_period_start: string | null; p_ended_at: string | null; p_status: string; p_stripe_event_created_at: number; p_stripe_price_id: string; p_stripe_subscription_id: string; p_user_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type JournalEntryRow = Database["public"]["Views"]["journal_entries"]["Row"];
