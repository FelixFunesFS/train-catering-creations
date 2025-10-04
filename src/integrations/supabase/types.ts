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
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_template: string
          created_at: string
          id: string
          is_default: boolean | null
          subject_template: string
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body_template: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          subject_template: string
          template_name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          subject_template?: string
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
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
          due_date: string | null
          id: string
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
          due_date?: string | null
          id?: string
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
          due_date?: string | null
          id?: string
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
          contract_id: string | null
          contract_signed_at: string | null
          created_at: string
          currency: string | null
          customer_access_token: string | null
          customer_feedback: Json | null
          customer_id: string | null
          document_type: string | null
          draft_data: Json | null
          due_date: string | null
          email_opened_at: string | null
          email_opened_count: number | null
          estimate_viewed_at: string | null
          estimate_viewed_count: number | null
          id: string
          invoice_number: string | null
          is_draft: boolean | null
          is_milestone_payment: boolean | null
          last_customer_action: string | null
          last_customer_interaction: string | null
          last_quote_sync: string | null
          last_status_change: string | null
          manual_overrides: Json | null
          notes: string | null
          original_quote_id: string | null
          override_reason: string | null
          paid_at: string | null
          payment_order: number | null
          payment_schedule_type: string | null
          pdf_url: string | null
          quote_request_id: string | null
          quote_version: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          sent_at: string | null
          status: string
          status_changed_by: string | null
          stripe_invoice_id: string | null
          subtotal: number
          tax_amount: number | null
          token_expires_at: string | null
          total_amount: number
          updated_at: string
          version: number
          viewed_at: string | null
          workflow_status:
            | Database["public"]["Enums"]["invoice_workflow_status"]
            | null
        }
        Insert: {
          contract_id?: string | null
          contract_signed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_access_token?: string | null
          customer_feedback?: Json | null
          customer_id?: string | null
          document_type?: string | null
          draft_data?: Json | null
          due_date?: string | null
          email_opened_at?: string | null
          email_opened_count?: number | null
          estimate_viewed_at?: string | null
          estimate_viewed_count?: number | null
          id?: string
          invoice_number?: string | null
          is_draft?: boolean | null
          is_milestone_payment?: boolean | null
          last_customer_action?: string | null
          last_customer_interaction?: string | null
          last_quote_sync?: string | null
          last_status_change?: string | null
          manual_overrides?: Json | null
          notes?: string | null
          original_quote_id?: string | null
          override_reason?: string | null
          paid_at?: string | null
          payment_order?: number | null
          payment_schedule_type?: string | null
          pdf_url?: string | null
          quote_request_id?: string | null
          quote_version?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          status_changed_by?: string | null
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          token_expires_at?: string | null
          total_amount?: number
          updated_at?: string
          version?: number
          viewed_at?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["invoice_workflow_status"]
            | null
        }
        Update: {
          contract_id?: string | null
          contract_signed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_access_token?: string | null
          customer_feedback?: Json | null
          customer_id?: string | null
          document_type?: string | null
          draft_data?: Json | null
          due_date?: string | null
          email_opened_at?: string | null
          email_opened_count?: number | null
          estimate_viewed_at?: string | null
          estimate_viewed_count?: number | null
          id?: string
          invoice_number?: string | null
          is_draft?: boolean | null
          is_milestone_payment?: boolean | null
          last_customer_action?: string | null
          last_customer_interaction?: string | null
          last_quote_sync?: string | null
          last_status_change?: string | null
          manual_overrides?: Json | null
          notes?: string | null
          original_quote_id?: string | null
          override_reason?: string | null
          paid_at?: string | null
          payment_order?: number | null
          payment_schedule_type?: string | null
          pdf_url?: string | null
          quote_request_id?: string | null
          quote_version?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          status_changed_by?: string | null
          stripe_invoice_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          token_expires_at?: string | null
          total_amount?: number
          updated_at?: string
          version?: number
          viewed_at?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["invoice_workflow_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_original_quote_id_fkey"
            columns: ["original_quote_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
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
          percentage?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
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
          invoice_status: string | null
          last_calendar_sync: string | null
          last_customer_interaction: string | null
          last_status_change: string | null
          linens_requested: boolean | null
          location: string
          napkins_requested: boolean | null
          phone: string
          plates_requested: boolean | null
          po_number: string | null
          primary_protein: string | null
          referral_source: string | null
          requires_po_number: boolean | null
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
          status_changed_by: string | null
          tables_chairs_requested: boolean | null
          theme_colors: string | null
          updated_at: string | null
          utensils: Json | null
          version: number
          wait_staff_requested: boolean | null
          wait_staff_requirements: string | null
          wait_staff_setup_areas: string | null
          workflow_status:
            | Database["public"]["Enums"]["quote_workflow_status"]
            | null
        }
        Insert: {
          appetizers?: Json | null
          both_proteins_available?: boolean | null
          bussing_tables_needed?: boolean | null
          calendar_event_id?: string | null
          calendar_sync_status?: string | null
          chafers_requested?: boolean | null
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
          invoice_status?: string | null
          last_calendar_sync?: string | null
          last_customer_interaction?: string | null
          last_status_change?: string | null
          linens_requested?: boolean | null
          location: string
          napkins_requested?: boolean | null
          phone: string
          plates_requested?: boolean | null
          po_number?: string | null
          primary_protein?: string | null
          referral_source?: string | null
          requires_po_number?: boolean | null
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
          status_changed_by?: string | null
          tables_chairs_requested?: boolean | null
          theme_colors?: string | null
          updated_at?: string | null
          utensils?: Json | null
          version?: number
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["quote_workflow_status"]
            | null
        }
        Update: {
          appetizers?: Json | null
          both_proteins_available?: boolean | null
          bussing_tables_needed?: boolean | null
          calendar_event_id?: string | null
          calendar_sync_status?: string | null
          chafers_requested?: boolean | null
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
          invoice_status?: string | null
          last_calendar_sync?: string | null
          last_customer_interaction?: string | null
          last_status_change?: string | null
          linens_requested?: boolean | null
          location?: string
          napkins_requested?: boolean | null
          phone?: string
          plates_requested?: boolean | null
          po_number?: string | null
          primary_protein?: string | null
          referral_source?: string | null
          requires_po_number?: boolean | null
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
          status_changed_by?: string | null
          tables_chairs_requested?: boolean | null
          theme_colors?: string | null
          updated_at?: string | null
          utensils?: Json | null
          version?: number
          wait_staff_requested?: boolean | null
          wait_staff_requirements?: string | null
          wait_staff_setup_areas?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["quote_workflow_status"]
            | null
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
      [_ in never]: never
    }
    Functions: {
      can_access_estimate: {
        Args: { access_token: string; customer_email: string }
        Returns: boolean
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      grant_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_original: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_dev_mode: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_dev_mode_original: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_access_token: {
        Args: { invoice_table_id: string; token_value: string }
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
      invoice_workflow_status:
        | "draft"
        | "pending_review"
        | "sent"
        | "viewed"
        | "approved"
        | "paid"
        | "overdue"
        | "cancelled"
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
