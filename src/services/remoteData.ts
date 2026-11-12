import { Meal, MealCategory, MealEstimationSource, MealPortion, Settings, UserProfile } from "../types";
import { isSupabaseConfigured, supabase, SUPABASE_BUCKET } from "./supabase";

type DbUser = {
  name: string;
  weight_kg: number;
  height_cm: number;
  daily_calorie_goal: number;
};

type DbSettings = {
  dark_mode: boolean;
  notifications_enabled: boolean;
};

type DbMeal = {
  id: string;
  calories: number;
  image_path: string;
  image_url: string;
  created_at: string;
  category?: MealCategory | null;
  portion?: MealPortion | null;
  estimation_source?: MealEstimationSource | null;
};

const legacyMealSelect = "id, calories, image_path, image_url, created_at";
const extendedMealSelect =
  "id, calories, image_path, image_url, created_at, category, portion, estimation_source";

const assertClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
};

const toUser = (data: DbUser): UserProfile => ({
  name: data.name,
  weightKg: data.weight_kg,
  heightCm: data.height_cm,
  dailyCalorieGoal: data.daily_calorie_goal
});

const toSettings = (data: DbSettings | null): Settings => {
  if (!data) {
    return { darkMode: false, notificationsEnabled: true };
  }

  return {
    darkMode: data.dark_mode,
    notificationsEnabled: data.notifications_enabled
  };
};

const toMeal = (data: DbMeal): Meal => ({
  id: data.id,
  calories: data.calories,
  imageUri: data.image_url,
  imagePath: data.image_path,
  createdAt: data.created_at,
  category: data.category ?? null,
  portion: data.portion ?? null,
  estimationSource: data.estimation_source ?? undefined
});

// React Native's Blob implementation does not expose blob.arrayBuffer() on
// all Expo runtimes. Supabase Storage accepts the Blob returned by fetch
// directly, so avoid calling the missing method here.
const readLocalFileAsBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`تعذر قراءة الصورة (${response.status})`);
  }
  return response.blob();
};

const toContentType = (uri: string): string => {
  const lowerUri = uri.toLowerCase();
  if (lowerUri.endsWith(".png")) return "image/png";
  if (lowerUri.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
};

export const remoteData = {
  isEnabled: isSupabaseConfigured,

  async getUser(profileId: string): Promise<UserProfile | null> {
    const client = assertClient();
    const { data, error } = await client
      .from("profiles")
      .select("name, weight_kg, height_cm, daily_calorie_goal")
      .eq("id", profileId)
      .maybeSingle();

    if (error) throw error;
    return data ? toUser(data as DbUser) : null;
  },

  async upsertUser(profileId: string, user: UserProfile): Promise<void> {
    const client = assertClient();
    const payload = {
      id: profileId,
      name: user.name,
      weight_kg: user.weightKg,
      height_cm: user.heightCm,
      daily_calorie_goal: user.dailyCalorieGoal
    };

    const { error } = await client.from("profiles").upsert(payload, { onConflict: "id" });
    if (error) throw error;
  },

  async getSettings(profileId: string): Promise<Settings> {
    const client = assertClient();
    const { data, error } = await client
      .from("settings")
      .select("dark_mode, notifications_enabled")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) throw error;
    return toSettings((data as DbSettings | null) ?? null);
  },

  async upsertSettings(profileId: string, settings: Settings): Promise<void> {
    const client = assertClient();
    const payload = {
      profile_id: profileId,
      dark_mode: settings.darkMode,
      notifications_enabled: settings.notificationsEnabled
    };

    const { error } = await client.from("settings").upsert(payload, { onConflict: "profile_id" });
    if (error) throw error;
  },

  async getMeals(profileId: string): Promise<Meal[]> {
    const client = assertClient();
    try {
      const { data, error } = await client
        .from("meals")
        .select(extendedMealSelect)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as DbMeal[]).map(toMeal);
    } catch (error) {
      const { data, error: legacyError } = await client
        .from("meals")
        .select(legacyMealSelect)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (legacyError) {
        throw legacyError;
      }

      console.warn("Falling back to legacy meals schema:", error);
      return (data as DbMeal[]).map(toMeal);
    }
  },

  async createMeal(profileId: string, meal: Meal): Promise<Meal> {
    const client = assertClient();
    const imagePath = `${profileId}/${meal.id}.jpg`;
    const contentType = toContentType(meal.imageUri);
    const file = await readLocalFileAsBlob(meal.imageUri);

    const upload = await client.storage.from(SUPABASE_BUCKET).upload(imagePath, file, {
      contentType,
      upsert: true
    });

    if (upload.error) throw upload.error;

    const publicUrl = client.storage.from(SUPABASE_BUCKET).getPublicUrl(imagePath).data.publicUrl;
    const payload = {
      id: meal.id,
      profile_id: profileId,
      calories: meal.calories,
      image_path: imagePath,
      image_url: publicUrl,
      created_at: meal.createdAt,
      category: meal.category ?? null,
      portion: meal.portion ?? null,
      estimation_source: meal.estimationSource ?? "preset"
    };

    try {
      const { data, error } = await client
        .from("meals")
        .upsert(payload, { onConflict: "id" })
        .select(extendedMealSelect)
        .single();

      if (error) throw error;
      return toMeal(data as DbMeal);
    } catch (error) {
      const legacyPayload = {
        id: meal.id,
        profile_id: profileId,
        calories: meal.calories,
        image_path: imagePath,
        image_url: publicUrl,
        created_at: meal.createdAt
      };

      const { data, error: legacyError } = await client
        .from("meals")
        .upsert(legacyPayload, { onConflict: "id" })
        .select(legacyMealSelect)
        .single();

      if (legacyError) {
        throw legacyError;
      }

      console.warn("Saved meal using legacy meals schema:", error);
      return toMeal(data as DbMeal);
    }
  }
};
