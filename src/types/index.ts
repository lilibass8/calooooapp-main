export type MealCategory =
  | "cooked-meal"
  | "sandwich-burger"
  | "pizza-pastry"
  | "salad"
  | "dessert"
  | "drink"
  | "fruit-snack";

export type MealPortion = "small" | "medium" | "large";

export type MealEstimationSource = "preset" | "manual-adjustment" | "legacy";

export type Language = "ar" | "en";

export type UserProfile = {
  name: string;
  weightKg: number;
  heightCm: number;
  dailyCalorieGoal: number;
};

export type Meal = {
  id: string;
  calories: number;
  imageUri: string;
  imagePath?: string;
  createdAt: string;
  category?: MealCategory | null;
  portion?: MealPortion | null;
  estimationSource?: MealEstimationSource;
};

export type Settings = {
  darkMode: boolean;
  notificationsEnabled: boolean;
  language: Language;
};

export type DailyStats = {
  goal: number;
  consumed: number;
  remaining: number;
  progress: number;
  mealCount: number;
};

export type MealHistorySection = {
  key: string;
  title: string;
  totalCalories: number;
  data: Meal[];
};
