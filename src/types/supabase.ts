export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      apis: {
        Row: {
          id: string;
          organizations_id: string | null;
          api_name: string | null;
          api_key: string | null;
          api_link: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          organizations_id?: string | null;
          api_name?: string | null;
          api_key?: string | null;
          api_link?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          organizations_id?: string | null;
          api_name?: string | null;
          api_key?: string | null;
          api_link?: string | null;
          created_at?: string | null;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string | null;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: string;
          content: string;
          created_at: string;
          meta_json: Json | null;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: string;
          content: string;
          created_at?: string;
          meta_json?: Json | null;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
          meta_json?: Json | null;
        };
      };
      streams: {
        Row: {
          id: string;
          chat_id: string;
          created_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          created_at?: string;
          status?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          created_at?: string;
          status?: string;
        };
      };
    };
  };
}
