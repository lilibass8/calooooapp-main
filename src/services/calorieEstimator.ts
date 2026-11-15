import { Language, MealCategory, MealPortion } from "../types";

type MealCategoryOption = {
  value: MealCategory;
  label: string;
  description: string;
  labelEn: string;
  descriptionEn: string;
  icon: string;
};

type PortionOption = {
  value: MealPortion;
  label: string;
  description: string;
  labelEn: string;
  descriptionEn: string;
};

const calorieMatrix: Record<MealCategory, Record<MealPortion, number>> = {
  "cooked-meal": {
    small: 350,
    medium: 550,
    large: 750
  },
  "sandwich-burger": {
    small: 300,
    medium: 500,
    large: 700
  },
  "pizza-pastry": {
    small: 280,
    medium: 420,
    large: 600
  },
  salad: {
    small: 120,
    medium: 220,
    large: 350
  },
  dessert: {
    small: 180,
    medium: 320,
    large: 480
  },
  drink: {
    small: 80,
    medium: 150,
    large: 230
  },
  "fruit-snack": {
    small: 90,
    medium: 170,
    large: 260
  }
};

export const mealCategoryOptions: MealCategoryOption[] = [
  {
    value: "cooked-meal",
    label: "وجبة مطبوخة",
    description: "أرز، دجاج، مكرونة، وجبات منزلية",
    labelEn: "Cooked meal",
    descriptionEn: "Rice, chicken, pasta, and homemade meals",
    icon: "restaurant-outline"
  },
  {
    value: "sandwich-burger",
    label: "ساندويتش أو برغر",
    description: "برغر، شاورما، سندويتشات سريعة",
    labelEn: "Sandwich or burger",
    descriptionEn: "Burgers, shawarma, and quick sandwiches",
    icon: "fast-food-outline"
  },
  {
    value: "pizza-pastry",
    label: "بيتزا أو معجنات",
    description: "بيتزا، فطائر، كرواسون وقطع مخبوزة",
    labelEn: "Pizza or pastry",
    descriptionEn: "Pizza, pies, croissants, and baked goods",
    icon: "pizza-outline"
  },
  {
    value: "salad",
    label: "سلطة",
    description: "خضار، سلطات خفيفة وممزوجة",
    labelEn: "Salad",
    descriptionEn: "Vegetables and light mixed salads",
    icon: "leaf-outline"
  },
  {
    value: "dessert",
    label: "تحلية",
    description: "كيك، آيس كريم، حلى، شوكولاتة",
    labelEn: "Dessert",
    descriptionEn: "Cake, ice cream, sweets, and chocolate",
    icon: "ice-cream-outline"
  },
  {
    value: "drink",
    label: "مشروب",
    description: "عصير، قهوة، شاي، مشروبات باردة",
    labelEn: "Drink",
    descriptionEn: "Juice, coffee, tea, and cold drinks",
    icon: "cafe-outline"
  },
  {
    value: "fruit-snack",
    label: "فاكهة أو سناك",
    description: "فاكهة، مكسرات، سناك خفيف",
    labelEn: "Fruit or snack",
    descriptionEn: "Fruit, nuts, and light snacks",
    icon: "nutrition-outline"
  }
];

export const mealPortionOptions: PortionOption[] = [
  {
    value: "small",
    label: "صغير",
    description: "كمية خفيفة أو حصة فردية صغيرة",
    labelEn: "Small",
    descriptionEn: "A light or small single serving"
  },
  {
    value: "medium",
    label: "متوسط",
    description: "الكمية المعتادة لمعظم الوجبات",
    labelEn: "Medium",
    descriptionEn: "The usual amount for most meals"
  },
  {
    value: "large",
    label: "كبير",
    description: "طبق ممتلئ أو حجم مشبع",
    labelEn: "Large",
    descriptionEn: "A full plate or filling portion"
  }
];

export const estimateCalories = (category: MealCategory, portion: MealPortion): number =>
  calorieMatrix[category][portion];

export const getMealCategoryLabel = (category: MealCategory | null | undefined, language: Language = "ar"): string => {
  const match = mealCategoryOptions.find((option) => option.value === category);
  return language === "en" ? match?.labelEn ?? "Previous record" : match?.label ?? "سجل سابق";
};

export const getMealCategoryDescription = (category: MealCategory | null | undefined, language: Language = "ar"): string => {
  const match = mealCategoryOptions.find((option) => option.value === category);
  return language === "en" ? match?.descriptionEn ?? "Meal saved before the update" : match?.description ?? "وجبة محفوظة قبل التحديث";
};

export const getMealCategoryIcon = (category: MealCategory | null | undefined): string => {
  const match = mealCategoryOptions.find((option) => option.value === category);
  return match?.icon ?? "time-outline";
};

export const getMealPortionLabel = (portion: MealPortion | null | undefined, language: Language = "ar"): string => {
  const match = mealPortionOptions.find((option) => option.value === portion);
  return language === "en" ? match?.labelEn ?? "Not specified" : match?.label ?? "غير محدد";
};
