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
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "admin_notes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "admin_notes_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
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
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "calendar_events_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
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
          updated_at: string
          workflow_status: string
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
          updated_at?: string
          workflow_status?: string
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
          updated_at?: string
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "change_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "change_requests_invoice_id_fkey"
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
          customer_type: string | null
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
          customer_type?: string | null
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
          customer_type?: string | null
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
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "customers_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
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
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "estimate_versions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
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
      event_documents: {
        Row: {
          created_at: string
          document_category: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_customer_visible: boolean
          notes: string | null
          quote_request_id: string
          updated_at: string
          uploaded_by: string
          version: number
        }
        Insert: {
          created_at?: string
          document_category: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_customer_visible?: boolean
          notes?: string | null
          quote_request_id: string
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Update: {
          created_at?: string
          document_category?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_customer_visible?: boolean
          notes?: string | null
          quote_request_id?: string
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_documents_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "event_documents_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "event_documents_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shopping_items: {
        Row: {
          category: string
          checked: boolean | null
          created_at: string | null
          id: string
          item_name: string
          quantity: string | null
          quote_request_id: string
          source: string | null
          unit: string | null
        }
        Insert: {
          category: string
          checked?: boolean | null
          created_at?: string | null
          id?: string
          item_name: string
          quantity?: string | null
          quote_request_id: string
          source?: string | null
          unit?: string | null
        }
        Update: {
          category?: string
          checked?: boolean | null
          created_at?: string | null
          id?: string
          item_name?: string
          quantity?: string | null
          quote_request_id?: string
          source?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_shopping_items_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "event_shopping_items_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "event_shopping_items_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_timeline_tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          days_before_event: number | null
          due_date: string | null
          id: string
          is_date_dependent: boolean | null
          notes: string | null
          quote_request_id: string
          task_name: string
          task_type: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          days_before_event?: number | null
          due_date?: string | null
          id?: string
          is_date_dependent?: boolean | null
          notes?: string | null
          quote_request_id: string
          task_name: string
          task_type: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          days_before_event?: number | null
          due_date?: string | null
          id?: string
          is_date_dependent?: boolean | null
          notes?: string | null
          quote_request_id?: string
          task_name?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_timeline_tasks_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "event_timeline_tasks_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "event_timeline_tasks_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
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
      invoice_audit_log: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          field_changed: string
          id: string
          invoice_id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed: string
          id?: string
          invoice_id: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed?: string
          id?: string
          invoice_id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_audit_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_audit_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_audit_log_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
          metadata: Json | null
          quantity: number
          sort_order: number | null
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
          metadata?: Json | null
          quantity?: number
          sort_order?: number | null
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
          metadata?: Json | null
          quantity?: number
          sort_order?: number | null
          title?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items_archive: {
        Row: {
          archive_reason: string | null
          archived_at: string
          category: string | null
          created_at: string
          description: string
          id: string
          invoice_id: string | null
          original_invoice_line_item_id: string
          quantity: number
          title: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string
          category?: string | null
          created_at?: string
          description: string
          id?: string
          invoice_id?: string | null
          original_invoice_line_item_id: string
          quantity?: number
          title?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string | null
          original_invoice_line_item_id?: string
          quantity?: number
          title?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          currency: string | null
          customer_access_token: string | null
          customer_id: string | null
          discount_amount: number | null
          discount_description: string | null
          discount_type: string | null
          document_type: string | null
          due_date: string | null
          email_opened_at: string | null
          id: string
          include_terms_and_conditions: boolean | null
          invoice_number: string | null
          is_draft: boolean | null
          is_milestone_payment: boolean | null
          last_customer_interaction: string | null
          last_reminder_sent_at: string | null
          last_status_change: string | null
          notes: string | null
          paid_at: string | null
          payment_order: number | null
          payment_schedule_type: string | null
          pdf_url: string | null
          quote_request_id: string | null
          reminder_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          sent_at: string | null
          status_changed_by: string | null
          stripe_invoice_id: string | null
          subtotal: number
          tax_amount: number | null
          terms_accepted_at: string | null
          token_expires_at: string | null
          total_amount: number
          updated_at: string
          version: number
          viewed_at: string | null
          workflow_status: Database["public"]["Enums"]["invoice_workflow_status"]
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_access_token?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          discount_description?: string | null
          discount_type?: string | null
          document_type?: string | null
          due_date?: string | null
          email_opened_at?: string | null
          id?: string
          include_terms_and_conditions?: boolean | null
          invoice_number?: string | null
          is_draft?: boolean | null
          is_milestone_payment?: boolean | null
          last_customer_interaction?: string | null
          last_reminder_sent_at?: string | null
          last_status_change?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_order?: number | null
          payment_schedule_type?: string | null
          pdf_url?: string | null
          quote_request_id?: string | null
          reminder_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status_changed_by?: string | null
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          terms_accepted_at?: string | null
          token_expires_at?: string | null
          total_amount?: number
          updated_at?: string
          version?: number
          viewed_at?: string | null
          workflow_status?: Database["public"]["Enums"]["invoice_workflow_status"]
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_access_token?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          discount_description?: string | null
          discount_type?: string | null
          document_type?: string | null
          due_date?: string | null
          email_opened_at?: string | null
          id?: string
          include_terms_and_conditions?: boolean | null
          invoice_number?: string | null
          is_draft?: boolean | null
          is_milestone_payment?: boolean | null
          last_customer_interaction?: string | null
          last_reminder_sent_at?: string | null
          last_status_change?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_order?: number | null
          payment_schedule_type?: string | null
          pdf_url?: string | null
          quote_request_id?: string | null
          reminder_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status_changed_by?: string | null
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          terms_accepted_at?: string | null
          token_expires_at?: string | null
          total_amount?: number
          updated_at?: string
          version?: number
          viewed_at?: string | null
          workflow_status?: Database["public"]["Enums"]["invoice_workflow_status"]
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
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "invoices_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
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
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "message_threads_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
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
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_milestones: {
        Row: {
          amount_cents: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_id: string | null
          is_due_now: boolean | null
          is_net30: boolean | null
          milestone_type: string
          payment_link_opened_at: string | null
          payment_link_sent_at: string | null
          percentage: number
          status: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          is_due_now?: boolean | null
          is_net30?: boolean | null
          milestone_type: string
          payment_link_opened_at?: string | null
          payment_link_sent_at?: string | null
          percentage: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          is_due_now?: boolean | null
          is_net30?: boolean | null
          milestone_type?: string
          payment_link_opened_at?: string | null
          payment_link_sent_at?: string | null
          percentage?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_milestones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_milestones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_milestones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedule_audit: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          invoice_id: string | null
          new_schedule: Json | null
          old_schedule: Json | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          new_schedule?: Json | null
          old_schedule?: Json | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          new_schedule?: Json | null
          old_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedule_audit_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_schedule_audit_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_schedule_audit_invoice_id_fkey"
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
          milestone_id: string | null
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
          milestone_id?: string | null
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
          milestone_id?: string | null
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
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "payment_milestones"
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
      quote_line_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          quantity: number
          quote_request_id: string
          title: string
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          quote_request_id: string
          title: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          quantity?: number
          quote_request_id?: string
          title?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      quote_request_history: {
        Row: {
          change_reason: string | null
          change_source: string | null
          change_timestamp: string
          changed_by: string | null
          contact_info: string | null
          created_at: string
          customer_summary: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          quote_request_id: string
        }
        Insert: {
          change_reason?: string | null
          change_source?: string | null
          change_timestamp?: string
          changed_by?: string | null
          contact_info?: string | null
          created_at?: string
          customer_summary?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          quote_request_id: string
        }
        Update: {
          change_reason?: string | null
          change_source?: string | null
          change_timestamp?: string
          changed_by?: string | null
          contact_info?: string | null
          created_at?: string
          customer_summary?: string | null
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
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "quote_request_history_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
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
          ceremony_included: boolean | null
          chafers_requested: boolean | null
          cocktail_hour: boolean | null
          compliance_level: string | null
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
          last_status_change: string | null
          location: string
          napkins_requested: boolean | null
          phone: string
          plates_requested: boolean | null
          po_number: string | null
          proteins: Json | null
          referral_source: string | null
          requires_po_number: boolean | null
          separate_serving_area: boolean | null
          service_type: Database["public"]["Enums"]["service_type"]
          serving_setup_area: string | null
          serving_start_time: string | null
          serving_utensils_requested: boolean | null
          sides: Json | null
          special_requests: string | null
          start_time: string
          status_changed_by: string | null
          theme_colors: string | null
          updated_at: string | null
          utensils: Json | null
          vegetarian_entrees: Json | null
          version: number
          wait_staff_requested: boolean | null
          wait_staff_requirements: string | null
          wait_staff_setup_areas: string | null
          workflow_status: Database["public"]["Enums"]["quote_workflow_status"]
        }
        Insert: {
          appetizers?: Json | null
          both_proteins_available?: boolean | null
          bussing_tables_needed?: boolean | null
          ceremony_included?: boolean | null
          chafers_requested?: boolean | null
          cocktail_hour?: boolean | null
          compliance_level?: string | null
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
          last_status_change?: string | null
          location: string
          napkins_requested?: boolean | null
          phone: string
          plates_requested?: boolean | null
          po_number?: string | null
          proteins?: Json | null
          referral_source?: string | null
          requires_po_number?: boolean | null
          separate_serving_area?: boolean | null
          service_type: Database["public"]["Enums"]["service_type"]
          serving_setup_area?: string | null
          serving_start_time?: string | null
          serving_utensils_requested?: boolean | null
          sides?: Json | null
          special_requests?: string | null
          start_time: string
          status_changed_by?: string | null
          theme_colors?: string | null
          updated_at?: string | null
          utensils?: Json | null
          vegetarian_entrees?: Json | null
          version?: number
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
          workflow_status?: Database["public"]["Enums"]["quote_workflow_status"]
        }
        Update: {
          appetizers?: Json | null
          both_proteins_available?: boolean | null
          bussing_tables_needed?: boolean | null
          ceremony_included?: boolean | null
          chafers_requested?: boolean | null
          cocktail_hour?: boolean | null
          compliance_level?: string | null
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
          last_status_change?: string | null
          location?: string
          napkins_requested?: boolean | null
          phone?: string
          plates_requested?: boolean | null
          po_number?: string | null
          proteins?: Json | null
          referral_source?: string | null
          requires_po_number?: boolean | null
          separate_serving_area?: boolean | null
          service_type?: Database["public"]["Enums"]["service_type"]
          serving_setup_area?: string | null
          serving_start_time?: string | null
          serving_utensils_requested?: boolean | null
          sides?: Json | null
          special_requests?: string | null
          start_time?: string
          status_changed_by?: string | null
          theme_colors?: string | null
          updated_at?: string | null
          utensils?: Json | null
          vegetarian_entrees?: Json | null
          version?: number
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
          workflow_status?: Database["public"]["Enums"]["quote_workflow_status"]
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
            referencedRelation: "event_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "reminder_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["invoice_id"]
          },
          {
            foreignKeyName: "reminder_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_assignments: {
        Row: {
          arrival_time: string | null
          confirmed: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          quote_request_id: string
          role: string
          staff_name: string
          updated_at: string | null
        }
        Insert: {
          arrival_time?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          quote_request_id: string
          role: string
          staff_name: string
          updated_at?: string | null
        }
        Update: {
          arrival_time?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          quote_request_id?: string
          role?: string
          staff_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "staff_assignments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "invoice_payment_summary"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "staff_assignments_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_state_log: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_status: string
          previous_status: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_status: string
          previous_status?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_status?: string
          previous_status?: string | null
        }
        Relationships: []
      }
      workflow_step_completion: {
        Row: {
          completed_at: string
          completed_by: string
          created_at: string
          id: string
          notes: string | null
          quote_request_id: string
          step_id: string
          step_name: string
        }
        Insert: {
          completed_at?: string
          completed_by?: string
          created_at?: string
          id?: string
          notes?: string | null
          quote_request_id: string
          step_id: string
          step_name: string
        }
        Update: {
          completed_at?: string
          completed_by?: string
          created_at?: string
          id?: string
          notes?: string | null
          quote_request_id?: string
          step_id?: string
          step_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      event_summary: {
        Row: {
          balance_due: number | null
          compliance_level: string | null
          contact_name: string | null
          days_until_event: number | null
          document_type: string | null
          due_date: string | null
          email: string | null
          event_date: string | null
          event_name: string | null
          event_type: Database["public"]["Enums"]["event_type"] | null
          guest_count: number | null
          invoice_id: string | null
          invoice_number: string | null
          invoice_status:
            | Database["public"]["Enums"]["invoice_workflow_status"]
            | null
          location: string | null
          paid_at: string | null
          payment_status: string | null
          phone: string | null
          po_number: string | null
          quote_created_at: string | null
          quote_id: string | null
          quote_status:
            | Database["public"]["Enums"]["quote_workflow_status"]
            | null
          requires_po_number: boolean | null
          risk_level: string | null
          sent_at: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          start_time: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          total_paid: number | null
          viewed_at: string | null
        }
        Relationships: []
      }
      invoice_payment_summary: {
        Row: {
          balance_remaining: number | null
          compliance_level: string | null
          contact_name: string | null
          days_overdue: number | null
          due_date: string | null
          email: string | null
          event_date: string | null
          event_name: string | null
          event_type: Database["public"]["Enums"]["event_type"] | null
          guest_count: number | null
          guest_count_with_restrictions: string | null
          invoice_created_at: string | null
          invoice_id: string | null
          invoice_number: string | null
          last_reminder_sent_at: string | null
          location: string | null
          milestones: Json | null
          paid_at: string | null
          phone: string | null
          quote_id: string | null
          reminder_count: number | null
          requires_po_number: boolean | null
          sent_at: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          special_requests: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          total_paid: number | null
          vegetarian_entrees: Json | null
          viewed_at: string | null
          workflow_status:
            | Database["public"]["Enums"]["invoice_workflow_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_estimate: {
        Args: { access_token: string; customer_email: string }
        Returns: boolean
      }
      check_workflow_consistency: {
        Args: { p_quote_id: string }
        Returns: {
          is_consistent: boolean
          issues: Json
        }[]
      }
      generate_invoice_number: { Args: never; Returns: string }
      get_estimate_with_line_items: {
        Args: { access_token: string }
        Returns: {
          invoice: Json
          line_items: Json
          milestones: Json
          quote: Json
        }[]
      }
      get_next_statuses: {
        Args: { current_status: string; entity_type: string }
        Returns: string[]
      }
      get_status_label: { Args: { status: string }; Returns: string }
      grant_first_admin: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_original: { Args: never; Returns: boolean }
      is_dev_mode: { Args: never; Returns: boolean }
      is_dev_mode_original: { Args: never; Returns: boolean }
      is_quote_owner: {
        Args: { quote_id: string; user_email: string }
        Returns: boolean
      }
      is_valid_access_token: {
        Args: { invoice_table_id: string; token_value: string }
        Returns: boolean
      }
      is_valid_status_transition: {
        Args: { entity_type: string; from_status: string; to_status: string }
        Returns: boolean
      }
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
        | "wedding"
        | "black_tie"
        | "military_function"
      invoice_workflow_status:
        | "draft"
        | "pending_review"
        | "sent"
        | "viewed"
        | "approved"
        | "paid"
        | "overdue"
        | "cancelled"
        | "payment_pending"
        | "partially_paid"
      quote_status:
        | "pending"
        | "reviewed"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      quote_workflow_status:
        | "pending"
        | "under_review"
        | "estimated"
        | "quoted"
        | "approved"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "awaiting_payment"
        | "paid"
      service_type:
        | "full-service"
        | "delivery-only"
        | "delivery-setup"
        | "drop-off"
      user_role: "admin" | "user"
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
        "wedding",
        "black_tie",
        "military_function",
      ],
      invoice_workflow_status: [
        "draft",
        "pending_review",
        "sent",
        "viewed",
        "approved",
        "paid",
        "overdue",
        "cancelled",
        "payment_pending",
        "partially_paid",
      ],
      quote_status: [
        "pending",
        "reviewed",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      quote_workflow_status: [
        "pending",
        "under_review",
        "estimated",
        "quoted",
        "approved",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "awaiting_payment",
        "paid",
      ],
      service_type: [
        "full-service",
        "delivery-only",
        "delivery-setup",
        "drop-off",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
