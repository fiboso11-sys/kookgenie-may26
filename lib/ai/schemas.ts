import { z } from "zod";

export const parsedFoodItemSchema = z.object({
  food_name: z.string().min(1).max(200),
  calories: z.number().int().min(0).max(8000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  quantity: z.number().positive().max(99).optional(),
  notes: z.string().max(300).optional(),
});

export const foodParseResponseSchema = z.object({
  items: z.array(parsedFoodItemSchema).min(1).max(12),
});

export type ParsedFoodItem = z.infer<typeof parsedFoodItemSchema>;
export type FoodParseResponse = z.infer<typeof foodParseResponseSchema>;

export const mealRecommendItemSchema = z.object({
  title: z.string().min(1).max(120),
  calories: z.number().int().min(0).max(8000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  rationale: z.string().max(280).optional(),
  tags: z.array(z.string().max(32)).max(8).optional(),
});

export const mealRecommendResponseSchema = z.object({
  meals: z.array(mealRecommendItemSchema).min(1).max(8),
  tips: z.array(z.string().max(200)).max(5).optional(),
});

export type MealRecommendResponse = z.infer<typeof mealRecommendResponseSchema>;

export const nutritionChatStructuredSchema = z.object({
  reply: z.string().min(1).max(4000),
  bullets: z.array(z.string().max(240)).max(8).optional(),
});

export type NutritionChatStructured = z.infer<typeof nutritionChatStructuredSchema>;

/** Single-item AI estimate → insert into `food_database` (verified=false). */
export const aiSingleFoodRowSchema = z.object({
  name: z.string().min(1).max(160),
  serving_size: z.string().min(1).max(120),
  reference_amount: z.number().positive().max(5000),
  reference_unit: z.enum(["g", "serving", "piece", "cup", "ml"]),
  calories: z.number().min(0).max(8000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  fiber: z.number().min(0).max(200).optional(),
  category: z.string().max(64).optional(),
  aliases: z.array(z.string().max(48)).max(16).optional(),
});

export type AiSingleFoodRow = z.infer<typeof aiSingleFoodRowSchema>;
