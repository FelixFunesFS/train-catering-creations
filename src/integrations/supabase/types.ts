export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_notes: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          id: string
          is_internal: boolean
          note_content: string
          priority_level: string | null
          quote_request_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_internal?: boolean
          note_content: string
          priority_level?: string | null
          quote_request_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_internal?: boolean
          note_content?: string
          priority_level?: string | null
          quote_request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_workflows: {
        Row: {
          actions: Json
          created_at: string | null
          description: string | null
          enabled: boolean | null
          error_count: number | null
          id: string
          last_run_at: string | null
          name: string
          success_count: number | null
          trigger_conditions: Json | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          error_count?: number | null
          id?: string
          last_run_at?: string | null
          name: string
          success_count?: number | null
          trigger_conditions?: Json | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          error_count?: number | null
          id?: string
          last_run_at?: string | null
          name?: string
          success_count?: number | null
          trigger_conditions?: Json | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      business_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          calendar_provider: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          event_title: string
          external_event_id: string | null
          id: string
          last_synced_at: string | null
          location: string | null
          quote_request_id: string | null
          start_time: string | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          calendar_provider?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_title: string
          external_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          location?: string | null
          quote_request_id?: string | null
          start_time?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          calendar_provider?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_title?: string
          external_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          location?: string | null
          quote_request_id?: string | null
          start_time?: string | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          admin_response: string | null
          completed_at: string | null
          created_at: string
          customer_comments: string | null
          customer_email: string
          estimated_cost_change: number | null
          id: string
          invoice_id: string | null
          original_details: Json | null
          priority: string
          request_type: string
          requested_changes: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          completed_at?: string | null
          created_at?: string
          customer_comments?: string | null
          customer_email: string
          estimated_cost_change?: number | null
          id?: string
          invoice_id?: string | null
          original_details?: Json | null
          priority?: string
          request_type?: string
          requested_changes: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          completed_at?: string | null
          created_at?: string
          customer_comments?: string | null
          customer_email?: string
          estimated_cost_change?: number | null
          id?: string
          invoice_id?: string | null
          original_details?: Json | null
          priority?: string
          request_type?: string
          requested_changes?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_html: string | null
          contract_type: string
          created_at: string
          generated_at: string | null
          id: string
          invoice_id: string | null
          signed_at: string | null
          signed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contract_html?: string | null
          contract_type?: string
          created_at?: string
          generated_at?: string | null
          id?: string
          invoice_id?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contract_html?: string | null
          contract_type?: string
          created_at?: string
          generated_at?: string | null
          id?: string
          invoice_id?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          quote_request_id: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          quote_request_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          quote_request_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_versions: {
        Row: {
          change_request_id: string | null
          created_at: string
          created_by: string
          id: string
          invoice_id: string | null
          line_items: Json
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          version_number: number
        }
        Insert: {
          change_request_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string | null
          line_items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          version_number?: number
        }
        Update: {
          change_request_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string | null
          line_items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_versions_change_request_id_fkey"
            columns: ["change_request_id"]
            isOneToOne: false
            referencedRelation: "change_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_versions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string
          email: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      government_contracts: {
        Row: {
          approved_at: string | null
          compliance_checklist: Json | null
          compliance_documentation: Json | null
          contract_status: string
          created_at: string
          id: string
          quote_request_id: string | null
          required_documents: string[] | null
          special_requirements: Json | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          compliance_checklist?: Json | null
          compliance_documentation?: Json | null
          contract_status?: string
          created_at?: string
          id?: string
          quote_request_id?: string | null
          required_documents?: string[] | null
          special_requirements?: Json | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          compliance_checklist?: Json | null
          compliance_documentation?: Json | null
          contract_status?: string
          created_at?: string
          id?: string
          quote_request_id?: string | null
          required_documents?: string[] | null
          special_requirements?: Json | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_contracts_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          invoice_id: string | null
          quantity: number
          title: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          title?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          title?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          currency: string | null
          customer_id: string | null
          draft_data: Json | null
          due_date: string | null
          id: string
          invoice_number: string | null
          is_draft: boolean | null
          last_quote_sync: string | null
          manual_overrides: Json | null
          notes: string | null
          override_reason: string | null
          paid_at: string | null
          pdf_url: string | null
          quote_request_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sent_at: string | null
          status: string
          stripe_invoice_id: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          draft_data?: Json | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          is_draft?: boolean | null
          last_quote_sync?: string | null
          manual_overrides?: Json | null
          notes?: string | null
          override_reason?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          quote_request_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          draft_data?: Json | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          is_draft?: boolean | null
          last_quote_sync?: string | null
          manual_overrides?: Json | null
          notes?: string | null
          override_reason?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          quote_request_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_message_at: string
          quote_request_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_message_at?: string
          quote_request_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_message_at?: string
          quote_request_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_template_used: boolean | null
          message_content: string
          message_type: string | null
          read_status: boolean
          sender_email: string
          sender_name: string
          sender_type: string
          template_name: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_template_used?: boolean | null
          message_content: string
          message_type?: string | null
          read_status?: boolean
          sender_email: string
          sender_name: string
          sender_type: string
          template_name?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_template_used?: boolean | null
          message_content?: string
          message_type?: string | null
          read_status?: boolean
          sender_email?: string
          sender_name?: string
          sender_type?: string
          template_name?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          transaction_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          description: string | null
          failed_reason: string | null
          id: string
          invoice_id: string | null
          payment_method: string | null
          payment_type: string
          processed_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email: string
          description?: string | null
          failed_reason?: string | null
          id?: string
          invoice_id?: string | null
          payment_method?: string | null
          payment_type: string
          processed_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          description?: string | null
          failed_reason?: string | null
          id?: string
          invoice_id?: string | null
          payment_method?: string | null
          payment_type?: string
          processed_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_price: number
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          item_name: string
          minimum_quantity: number | null
          price_per_person: number | null
          service_type: string | null
          updated_at: string
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          item_name: string
          minimum_quantity?: number | null
          price_per_person?: number | null
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          item_name?: string
          minimum_quantity?: number | null
          price_per_person?: number | null
          service_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_request_history: {
        Row: {
          change_reason: string | null
          change_timestamp: string
          changed_by: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          quote_request_id: string
        }
        Insert: {
          change_reason?: string | null
          change_timestamp?: string
          changed_by?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          quote_request_id: string
        }
        Update: {
          change_reason?: string | null
          change_timestamp?: string
          changed_by?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          quote_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_history_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          appetizers: Json | null
          both_proteins_available: boolean | null
          bussing_tables_needed: boolean | null
          calendar_event_id: string | null
          calendar_sync_status: string | null
          chafers_requested: boolean | null
          contact_name: string
          created_at: string | null
          cups_requested: boolean | null
          custom_menu_requests: string | null
          desserts: Json | null
          dietary_restrictions: Json | null
          drinks: Json | null
          email: string
          estimated_total: number | null
          event_date: string
          event_name: string
          event_type: Database["public"]["Enums"]["event_type"]
          extras: Json | null
          final_total: number | null
          guest_count: number
          guest_count_with_restrictions: string | null
          ice_requested: boolean | null
          id: string
          invoice_status: string | null
          last_calendar_sync: string | null
          linens_requested: boolean | null
          location: string
          napkins_requested: boolean | null
          phone: string
          plates_requested: boolean | null
          primary_protein: string | null
          referral_source: string | null
          secondary_protein: string | null
          separate_serving_area: boolean | null
          service_type: Database["public"]["Enums"]["service_type"]
          serving_setup_area: string | null
          serving_start_time: string | null
          serving_utensils_requested: boolean | null
          sides: Json | null
          special_requests: string | null
          start_time: string
          status: Database["public"]["Enums"]["quote_status"] | null
          tables_chairs_requested: boolean | null
          theme_colors: string | null
          updated_at: string | null
          utensils: Json | null
          wait_staff_requested: boolean | null
          wait_staff_requirements: string | null
          wait_staff_setup_areas: string | null
        }
        Insert: {
          appetizers?: Json | null
          both_proteins_available?: boolean | null
          bussing_tables_needed?: boolean | null
          calendar_event_id?: string | null
          calendar_sync_status?: string | null
          chafers_requested?: boolean | null
          contact_name: string
          created_at?: string | null
          cups_requested?: boolean | null
          custom_menu_requests?: string | null
          desserts?: Json | null
          dietary_restrictions?: Json | null
          drinks?: Json | null
          email: string
          estimated_total?: number | null
          event_date: string
          event_name: string
          event_type: Database["public"]["Enums"]["event_type"]
          extras?: Json | null
          final_total?: number | null
          guest_count: number
          guest_count_with_restrictions?: string | null
          ice_requested?: boolean | null
          id?: string
          invoice_status?: string | null
          last_calendar_sync?: string | null
          linens_requested?: boolean | null
          location: string
          napkins_requested?: boolean | null
          phone: string
          plates_requested?: boolean | null
          primary_protein?: string | null
          referral_source?: string | null
          secondary_protein?: string | null
          separate_serving_area?: boolean | null
          service_type: Database["public"]["Enums"]["service_type"]
          serving_setup_area?: string | null
          serving_start_time?: string | null
          serving_utensils_requested?: boolean | null
          sides?: Json | null
          special_requests?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          tables_chairs_requested?: boolean | null
          theme_colors?: string | null
          updated_at?: string | null
          utensils?: Json | null
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
        }
        Update: {
          appetizers?: Json | null
          both_proteins_available?: boolean | null
          bussing_tables_needed?: boolean | null
          calendar_event_id?: string | null
          calendar_sync_status?: string | null
          chafers_requested?: boolean | null
          contact_name?: string
          created_at?: string | null
          cups_requested?: boolean | null
          custom_menu_requests?: string | null
          desserts?: Json | null
          dietary_restrictions?: Json | null
          drinks?: Json | null
          email?: string
          estimated_total?: number | null
          event_date?: string
          event_name?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          extras?: Json | null
          final_total?: number | null
          guest_count?: number
          guest_count_with_restrictions?: string | null
          ice_requested?: boolean | null
          id?: string
          invoice_status?: string | null
          last_calendar_sync?: string | null
          linens_requested?: boolean | null
          location?: string
          napkins_requested?: boolean | null
          phone?: string
          plates_requested?: boolean | null
          primary_protein?: string | null
          referral_source?: string | null
          secondary_protein?: string | null
          separate_serving_area?: boolean | null
          service_type?: Database["public"]["Enums"]["service_type"]
          serving_setup_area?: string | null
          serving_start_time?: string | null
          serving_utensils_requested?: boolean | null
          sides?: Json | null
          special_requests?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          tables_chairs_requested?: boolean | null
          theme_colors?: string | null
          updated_at?: string | null
          utensils?: Json | null
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          created_at: string
          id: string
          invoice_id: string | null
          recipient_email: string
          reminder_type: string
          sent_at: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          recipient_email: string
          reminder_type: string
          sent_at?: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string | null
          recipient_email?: string
          reminder_type?: string
          sent_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_type:
        | "corporate"
        | "private_party"
        | "birthday"
        | "baby_shower"
        | "bereavement"
        | "graduation"
        | "retirement"
        | "holiday_party"
        | "anniversary"
        | "other"
      quote_status:
        | "pending"
        | "reviewed"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      service_type:
        | "full-service"
        | "delivery-only"
        | "delivery-setup"
        | "drop-off"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: [
        "corporate",
        "private_party",
        "birthday",
        "baby_shower",
        "bereavement",
        "graduation",
        "retirement",
        "holiday_party",
        "anniversary",
        "other",
      ],
      quote_status: [
        "pending",
        "reviewed",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      service_type: [
        "full-service",
        "delivery-only",
        "delivery-setup",
        "drop-off",
      ],
    },
  },
} as const
