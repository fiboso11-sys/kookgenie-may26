export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          age: number | null;
          gender: string | null;
          height: number | null;
          weight: number | null;
          target_weight: number | null;
          activity_level: string | null;
          goal: string | null;
          daily_calorie_goal: number | null;
          daily_protein_goal_g: number | null;
          daily_carbs_goal_g: number | null;
          daily_fat_goal_g: number | null;
          daily_water_goal_ml: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          age?: number | null;
          gender?: string | null;
          height?: number | null;
          weight?: number | null;
          target_weight?: number | null;
          activity_level?: string | null;
          goal?: string | null;
          daily_calorie_goal?: number | null;
          daily_protein_goal_g?: number | null;
          daily_carbs_goal_g?: number | null;
          daily_fat_goal_g?: number | null;
          daily_water_goal_ml?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          age?: number | null;
          gender?: string | null;
          height?: number | null;
          weight?: number | null;
          target_weight?: number | null;
          activity_level?: string | null;
          goal?: string | null;
          daily_calorie_goal?: number | null;
          daily_protein_goal_g?: number | null;
          daily_carbs_goal_g?: number | null;
          daily_fat_goal_g?: number | null;
          daily_water_goal_ml?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      food_logs: {
        Row: {
          id: string;
          user_id: string;
          food_name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          quantity: number;
          meal_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_name: string;
          calories: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          quantity?: number;
          meal_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_name?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          quantity?: number;
          meal_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      food_database: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          external_food_id: string | null;
          normalized_name: string;
          serving_size: string;
          serving_unit: string | null;
          reference_amount: number;
          reference_unit: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          fiber: number | null;
          sugar: number | null;
          sodium: number | null;
          category: string | null;
          aliases: string[];
          verified: boolean;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand?: string | null;
          external_food_id?: string | null;
          normalized_name?: string;
          serving_size?: string;
          serving_unit?: string | null;
          reference_amount?: number;
          reference_unit?: string;
          calories: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          fiber?: number | null;
          sugar?: number | null;
          sodium?: number | null;
          category?: string | null;
          aliases?: string[];
          verified?: boolean;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string | null;
          external_food_id?: string | null;
          normalized_name?: string;
          serving_size?: string;
          serving_unit?: string | null;
          reference_amount?: number;
          reference_unit?: string;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          fiber?: number | null;
          sugar?: number | null;
          sodium?: number | null;
          category?: string | null;
          aliases?: string[];
          verified?: boolean;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      food_favorites: {
        Row: {
          user_id: string;
          food_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          food_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          food_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      water_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_ml?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weight?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          title: string;
          cuisine: string | null;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          ingredients: Json;
          steps: Json;
          image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          cuisine?: string | null;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          ingredients?: Json;
          steps?: Json;
          image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          cuisine?: string | null;
          calories?: number;
          protein?: number;
          carbs?: number;
          fat?: number;
          ingredients?: Json;
          steps?: Json;
          image?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
        };
        Relationships: [];
      };
      ai_cache: {
        Row: {
          id: string;
          prompt_hash: string;
          prompt: string;
          response: Json;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_hash: string;
          prompt: string;
          response: Json;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_hash?: string;
          prompt?: string;
          response?: Json;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_food_database: {
        Args: { search: string; lim?: number };
        Returns: Database["public"]["Tables"]["food_database"]["Row"][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type FoodLog = Database["public"]["Tables"]["food_logs"]["Row"];
export type FoodDatabaseRow = Database["public"]["Tables"]["food_database"]["Row"];
export type FoodLogInsert = Database["public"]["Tables"]["food_logs"]["Insert"];
export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type WaterLog = Database["public"]["Tables"]["water_logs"]["Row"];
export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
