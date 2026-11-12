import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal, Settings, UserProfile } from "../types";

const KEYS = {
  user: "caloriesnap:user",
  meals: "caloriesnap:meals",
  settings: "caloriesnap:settings",
  lastReset: "caloriesnap:lastReset"
} as const;

const getTodayKey = () => new Date().toDateString();

export const storage = {
  async getUser(): Promise<UserProfile | null> {
    const value = await AsyncStorage.getItem(KEYS.user);
    return value ? (JSON.parse(value) as UserProfile) : null;
  },
  async setUser(user: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
  },
  async getMeals(): Promise<Meal[]> {
    const value = await AsyncStorage.getItem(KEYS.meals);
    return value ? (JSON.parse(value) as Meal[]) : [];
  },
  async setMeals(meals: Meal[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.meals, JSON.stringify(meals));
  },
  async getSettings(): Promise<Settings> {
    const value = await AsyncStorage.getItem(KEYS.settings);
    if (!value) {
      return { darkMode: false, notificationsEnabled: true };
    }
    return JSON.parse(value) as Settings;
  },
  async setSettings(settings: Settings): Promise<void> {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  },
  async getLastResetDate(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.lastReset);
  },
  async setLastResetDate(dateKey: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.lastReset, dateKey);
  },
  async ensureDailyReset(): Promise<boolean> {
    const todayKey = getTodayKey();
    const lastReset = await AsyncStorage.getItem(KEYS.lastReset);
    if (lastReset !== todayKey) {
      await AsyncStorage.setItem(KEYS.lastReset, todayKey);
      return true;
    }
    return false;
  }
};

export const utils = {
  getTodayKey,
  isSameDay(dateIso: string, dayKey: string) {
    return new Date(dateIso).toDateString() === dayKey;
  }
};
