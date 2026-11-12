import { DailyStats, Meal, MealEstimationSource, MealHistorySection, UserProfile } from "../types";

const isValidDate = (value: string) => !Number.isNaN(new Date(value).getTime());

const resolveEstimationSource = (meal: Meal): MealEstimationSource => {
  if (meal.estimationSource) {
    return meal.estimationSource;
  }

  if (meal.category && meal.portion) {
    return "preset";
  }

  return "legacy";
};

export const normalizeMeal = (meal: Meal): Meal => ({
  ...meal,
  imagePath: meal.imagePath,
  category: meal.category ?? null,
  portion: meal.portion ?? null,
  estimationSource: resolveEstimationSource(meal)
});

export const sortMeals = (meals: Meal[]): Meal[] =>
  [...meals]
    .map(normalizeMeal)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const isSameDay = (dateIso: string, compareDate = new Date()): boolean => {
  if (!isValidDate(dateIso)) {
    return false;
  }

  return new Date(dateIso).toDateString() === compareDate.toDateString();
};

export const getTodayMeals = (meals: Meal[]): Meal[] => meals.filter((meal) => isSameDay(meal.createdAt));

export const buildDailyStats = (meals: Meal[], user: UserProfile | null): DailyStats => {
  const consumed = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const goal = user?.dailyCalorieGoal ?? 0;
  const remaining = Math.max(goal - consumed, 0);
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  return {
    goal,
    consumed,
    remaining,
    progress,
    mealCount: meals.length
  };
};

const arabicDateFormatter = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  day: "numeric",
  month: "long"
});

export const buildHistorySections = (meals: Meal[]): MealHistorySection[] => {
  const grouped = new Map<string, Meal[]>();

  sortMeals(meals).forEach((meal) => {
    const key = isValidDate(meal.createdAt)
      ? new Date(meal.createdAt).toDateString()
      : "unknown";
    const existing = grouped.get(key) ?? [];
    existing.push(meal);
    grouped.set(key, existing);
  });

  return Array.from(grouped.entries()).map(([key, data]) => ({
    key,
    title:
      key === "unknown"
        ? "سجلات غير معروفة التاريخ"
        : arabicDateFormatter.format(new Date(data[0].createdAt)),
    totalCalories: data.reduce((sum, meal) => sum + meal.calories, 0),
    data
  }));
};
