import { Meal, MealCategory, MealPortion } from "../types";

/**
 * بيانات مرجعية للتطوير والعرض فقط.
 * لا يتم تحميلها تلقائيًا، لذلك لا تغيّر بيانات المستخدم أو سلوك التطبيق.
 */
export const sampleMeals: Meal[] = [
  {
    id: "sample-breakfast",
    calories: 420,
    imageUri: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea",
    createdAt: "2026-01-15T08:30:00.000Z",
    category: "fruit-snack" as MealCategory,
    portion: "medium" as MealPortion,
    estimationSource: "preset"
  },
  {
    id: "sample-lunch",
    calories: 680,
    imageUri: "https://images.unsplash.com/photo-1547592180-85f173990554",
    createdAt: "2026-01-15T13:15:00.000Z",
    category: "cooked-meal",
    portion: "large",
    estimationSource: "preset"
  }
];

export const sampleDailyGoal = 2000;

