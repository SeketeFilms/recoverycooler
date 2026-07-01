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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accountability_partners: {
        Row: {
          created_at: string
          id: string
          partner_user_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_user_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_user_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          badge_color: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          badge_color?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          badge_color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      app_reviews: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          is_required: boolean
          minimum_supported_version: string | null
          release_date: string
          release_notes: string
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          is_required?: boolean
          minimum_supported_version?: string | null
          release_date?: string
          release_notes: string
          version: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          is_required?: boolean
          minimum_supported_version?: string | null
          release_date?: string
          release_notes?: string
          version?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          addiction_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          addiction_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          addiction_type?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      check_in_schedules: {
        Row: {
          check_in_time: string
          created_at: string
          frequency: string
          id: string
          is_enabled: boolean
          message: string | null
          user_id: string
        }
        Insert: {
          check_in_time: string
          created_at?: string
          frequency?: string
          id?: string
          is_enabled?: boolean
          message?: string | null
          user_id: string
        }
        Update: {
          check_in_time?: string
          created_at?: string
          frequency?: string
          id?: string
          is_enabled?: boolean
          message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      coping_strategies: {
        Row: {
          created_at: string
          effectiveness_rating: number | null
          id: string
          strategy_description: string
          strategy_name: string
          times_used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          strategy_description: string
          strategy_name: string
          times_used?: number
          user_id: string
        }
        Update: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          strategy_description?: string
          strategy_name?: string
          times_used?: number
          user_id?: string
        }
        Relationships: []
      }
      crisis_resources: {
        Row: {
          addiction_type: string
          content: Json
          created_at: string
          description: string
          id: string
          resource_type: string
          title: string
        }
        Insert: {
          addiction_type: string
          content: Json
          created_at?: string
          description: string
          id?: string
          resource_type: string
          title: string
        }
        Update: {
          addiction_type?: string
          content?: Json
          created_at?: string
          description?: string
          id?: string
          resource_type?: string
          title?: string
        }
        Relationships: []
      }
      email_rate_limits: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          addiction_type: string
          comments_count: number
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          pinned: boolean
          title: string
          user_id: string
        }
        Insert: {
          addiction_type: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          pinned?: boolean
          title: string
          user_id: string
        }
        Update: {
          addiction_type?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          pinned?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          coping_strategies_used: string[] | null
          created_at: string
          entry_date: string
          gratitude: string | null
          id: string
          mood: number | null
          notes: string | null
          photo_url: string | null
          triggers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coping_strategies_used?: string[] | null
          created_at?: string
          entry_date?: string
          gratitude?: string | null
          id?: string
          mood?: number | null
          notes?: string | null
          photo_url?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coping_strategies_used?: string[] | null
          created_at?: string
          entry_date?: string
          gratitude?: string | null
          id?: string
          mood?: number | null
          notes?: string | null
          photo_url?: string | null
          triggers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journey_appeals: {
        Row: {
          created_at: string
          decision_notes: string | null
          id: string
          journey_id: string
          message: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decision_notes?: string | null
          id?: string
          journey_id: string
          message: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decision_notes?: string | null
          id?: string
          journey_id?: string
          message?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_appeals_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "public_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          journey_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          journey_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          journey_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_comments_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "public_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_follows: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          journey_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          journey_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          journey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_follows_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "public_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_likes: {
        Row: {
          created_at: string
          id: string
          journey_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journey_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_likes_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "public_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_minutes: number
          id: string
          track_name: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          track_name?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number
          id?: string
          track_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: string
          journey_id: string | null
          notes: string | null
          report_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: string
          journey_id?: string | null
          notes?: string | null
          report_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: string
          journey_id?: string | null
          notes?: string | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "public_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "content_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          checkin_time: string | null
          created_at: string
          id: string
          meditation_reminders: boolean | null
          meditation_time: string | null
          recovery_checkins: boolean | null
          spending_alerts: boolean | null
          time_reminder_at: string | null
          time_reminder_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_time?: string | null
          created_at?: string
          id?: string
          meditation_reminders?: boolean | null
          meditation_time?: string | null
          recovery_checkins?: boolean | null
          spending_alerts?: boolean | null
          time_reminder_at?: string | null
          time_reminder_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_time?: string | null
          created_at?: string
          id?: string
          meditation_reminders?: boolean | null
          meditation_time?: string | null
          recovery_checkins?: boolean | null
          spending_alerts?: boolean | null
          time_reminder_at?: string | null
          time_reminder_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          recipient_id: string
          target_id: string | null
          target_type: string | null
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          recipient_id: string
          target_id?: string | null
          target_type?: string | null
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          recipient_id?: string
          target_id?: string | null
          target_type?: string | null
          type?: string
        }
        Relationships: []
      }
      personal_triggers: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          severity: number
          trigger_category: string
          trigger_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          severity?: number
          trigger_category: string
          trigger_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          severity?: number
          trigger_category?: string
          trigger_name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          addiction_type: string
          avatar_url: string | null
          country: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          id: string
          tutorial_completed: boolean
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          addiction_type?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          tutorial_completed?: boolean
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          addiction_type?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          tutorial_completed?: boolean
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          clean_since: string
          created_at: string
          current_streak: number
          id: string
          last_check_in: string | null
          longest_streak: number
          total_check_ins: number
          updated_at: string
          user_id: string
        }
        Insert: {
          clean_since?: string
          created_at?: string
          current_streak?: number
          id?: string
          last_check_in?: string | null
          longest_streak?: number
          total_check_ins?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          clean_since?: string
          created_at?: string
          current_streak?: number
          id?: string
          last_check_in?: string | null
          longest_streak?: number
          total_check_ins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_journeys: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          moderation_status: string
          nickname: string | null
          show_achievements: boolean
          show_avatar: boolean
          show_milestones: boolean
          show_streak: boolean
          slug: string
          story: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          moderation_status?: string
          nickname?: string | null
          show_achievements?: boolean
          show_avatar?: boolean
          show_milestones?: boolean
          show_streak?: boolean
          slug: string
          story?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          moderation_status?: string
          nickname?: string | null
          show_achievements?: boolean
          show_avatar?: boolean
          show_milestones?: boolean
          show_streak?: boolean
          slug?: string
          story?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      relapse_logs: {
        Row: {
          created_at: string
          id: string
          lessons_learned: string | null
          mood_after: number | null
          mood_before: number | null
          notes: string | null
          relapse_date: string
          severity: number
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lessons_learned?: string | null
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          relapse_date?: string
          severity?: number
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lessons_learned?: string | null
          mood_after?: number | null
          mood_before?: number | null
          notes?: string | null
          relapse_date?: string
          severity?: number
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      risky_locations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          location_name: string
          longitude: number | null
          notes: string | null
          radius: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          location_name: string
          longitude?: number | null
          notes?: string | null
          radius?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          location_name?: string
          longitude?: number | null
          notes?: string | null
          radius?: number
          user_id?: string
        }
        Relationships: []
      }
      self_exclusion_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      self_exclusion_periods: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          reason: string | null
          starts_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          reason?: string | null
          starts_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          location_info: string | null
          login_time: string
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          location_info?: string | null
          login_time?: string
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          location_info?: string | null
          login_time?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spending_limits: {
        Row: {
          daily_limit: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          daily_limit: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          daily_limit?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spending_logs: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          addiction_type: string
          comments_count: number
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          likes_count: number
          pinned: boolean
          title: string
          user_id: string
        }
        Insert: {
          addiction_type: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          likes_count?: number
          pinned?: boolean
          title: string
          user_id: string
        }
        Update: {
          addiction_type?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          likes_count?: number
          pinned?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      success_story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          story_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          story_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "success_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_shortcuts: {
        Row: {
          created_at: string
          id: string
          position: number
          shortcut_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          shortcut_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          shortcut_key?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_app_reviews: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          id: string
          is_anonymous: boolean
          rating: number
          review_text: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
