/**
 * Startup Copilot OS — Database TypeScript types
 * Keep in sync with supabase/schema.sql
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          company: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          company?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string;
          company?: string | null;
          role?: string | null;
          updated_at?: string;
        };
      };
      user_workspace: {
        Row: {
          user_id: string;
          integrations: Json;
          agents: Json;
          chat_history: Json;
          notifications: Json;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          integrations?: Json;
          agents?: Json;
          chat_history?: Json;
          notifications?: Json;
          updated_at?: string;
        };
        Update: {
          integrations?: Json;
          agents?: Json;
          chat_history?: Json;
          notifications?: Json;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          arr: number;
          health: "healthy" | "at-risk" | "churned";
          last_active: string;
          tickets_open: number;
          nps: number;
          stage: "trial" | "active" | "enterprise" | "churned";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          arr?: number;
          health: "healthy" | "at-risk" | "churned";
          last_active?: string;
          tickets_open?: number;
          nps?: number;
          stage: "trial" | "active" | "enterprise" | "churned";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      revenue_snapshots: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          mrr: number;
          new_mrr: number;
          churned_mrr: number;
          expansion_mrr: number;
          customers: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          mrr?: number;
          new_mrr?: number;
          churned_mrr?: number;
          expansion_mrr?: number;
          customers?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["revenue_snapshots"]["Insert"]>;
      };
      team_members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          role: string;
          avatar: string;
          prs_this_week: number;
          commits_this_week: number;
          status: "active" | "away" | "blocked";
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          role: string;
          avatar?: string;
          prs_this_week?: number;
          commits_this_week?: number;
          status: "active" | "away" | "blocked";
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
      };
      business_metrics: {
        Row: {
          user_id: string;
          mrr: number;
          customers: number;
          burn_rate: number;
          cash_on_hand: number;
          team_prs: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          mrr?: number;
          customers?: number;
          burn_rate?: number;
          cash_on_hand?: number;
          team_prs?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_metrics"]["Insert"]>;
      };
      user_integrations: {
        Row: {
          id: string;
          user_id: string;
          provider_id: string;
          connected: boolean;
          account_label: string | null;
          credentials: Json;
          last_synced: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider_id: string;
          connected?: boolean;
          account_label?: string | null;
          credentials?: Json;
          last_synced?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_integrations"]["Insert"]>;
      };
      leave_requests: {
        Row: {
          id: string;
          user_id: string;
          employee_name: string;
          employee_email: string;
          leave_type: "annual" | "sick" | "personal" | "unpaid" | "other";
          start_date: string;
          end_date: string;
          days: number;
          reason: string;
          status: "pending" | "approved" | "rejected";
          reviewer_note: string | null;
          email_sent: boolean;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          employee_name: string;
          employee_email: string;
          leave_type: "annual" | "sick" | "personal" | "unpaid" | "other";
          start_date: string;
          end_date: string;
          days?: number;
          reason?: string;
          status?: "pending" | "approved" | "rejected";
          reviewer_note?: string | null;
          email_sent?: boolean;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leave_requests"]["Insert"]>;
      };
    };
    Functions: {
      seed_demo_data: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
    };
  };
};
