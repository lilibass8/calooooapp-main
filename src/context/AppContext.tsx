import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DailyStats, Meal, MealHistorySection, Settings, UserProfile } from "../types";
import { storage } from "../storage/storage";
import { getOrCreateProfileId } from "../services/deviceProfile";
import { remoteData } from "../services/remoteData";
import { buildDailyStats, buildHistorySections, getTodayMeals, sortMeals } from "../services/meal-utils";

export type AppState = {
  user: UserProfile | null;
  meals: Meal[];
  todayMeals: Meal[];
  historySections: MealHistorySection[];
  dailyStats: DailyStats;
  settings: Settings;
  isLoading: boolean;
};

export type AppContextValue = AppState & {
  setUser: (user: UserProfile) => Promise<void>;
  addMeal: (meal: Meal) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  refreshDaily: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [settings, setSettingsState] = useState<Settings>({
    darkMode: false,
    notificationsEnabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    await storage.ensureDailyReset();

    const nextProfileId = await getOrCreateProfileId();
    setProfileId(nextProfileId);

    if (remoteData.isEnabled) {
      try {
        const [remoteUser, remoteMeals, remoteSettings] = await Promise.all([
          remoteData.getUser(nextProfileId),
          remoteData.getMeals(nextProfileId),
          remoteData.getSettings(nextProfileId)
        ]);

        const normalizedRemoteMeals = sortMeals(remoteMeals);

        setUserState(remoteUser);
        setMeals(normalizedRemoteMeals);
        setSettingsState(remoteSettings);

        if (remoteUser) {
          await storage.setUser(remoteUser);
        }
        await storage.setMeals(normalizedRemoteMeals);
        await storage.setSettings(remoteSettings);

        setIsLoading(false);
        return;
      } catch (error) {
        console.warn("Supabase sync failed, using local storage:", error);
      }
    }

    const [storedUser, storedMeals, storedSettings] = await Promise.all([
      storage.getUser(),
      storage.getMeals(),
      storage.getSettings()
    ]);

    const normalizedStoredMeals = sortMeals(storedMeals);

    setUserState(storedUser);
    setMeals(normalizedStoredMeals);
    setSettingsState(storedSettings);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setUser = async (nextUser: UserProfile) => {
    setUserState(nextUser);
    await storage.setUser(nextUser);

    if (remoteData.isEnabled && profileId) {
      try {
        await remoteData.upsertUser(profileId, nextUser);
      } catch (error) {
        console.warn("Failed to save profile to Supabase:", error);
        throw error;
      }
    }
  };

  const addMeal = async (meal: Meal) => {
    await storage.ensureDailyReset();

    let savedMeal = meal;

    if (remoteData.isEnabled && profileId) {
      try {
        savedMeal = await remoteData.createMeal(profileId, meal);
      } catch (error) {
        console.warn("Failed to upload meal to Supabase:", error);
        throw error;
      }
    }

    const updatedMeals = sortMeals([savedMeal, ...meals]);

    setMeals(updatedMeals);
    await storage.setMeals(updatedMeals);
  };

  const updateSettings = async (nextSettings: Settings) => {
    setSettingsState(nextSettings);
    await storage.setSettings(nextSettings);

    if (remoteData.isEnabled && profileId) {
      try {
        await remoteData.upsertSettings(profileId, nextSettings);
      } catch (error) {
        console.warn("Failed to save settings to Supabase:", error);
        throw error;
      }
    }
  };

  const refreshDaily = async () => {
    if (remoteData.isEnabled && profileId) {
      try {
        const remoteMeals = sortMeals(await remoteData.getMeals(profileId));
        setMeals(remoteMeals);
        await storage.setMeals(remoteMeals);
        return;
      } catch (error) {
        console.warn("Failed to refresh from Supabase:", error);
      }
    }

    const storedMeals = sortMeals(await storage.getMeals());
    setMeals(storedMeals);
  };

  const todayMeals = useMemo(() => getTodayMeals(meals), [meals]);
  const historySections = useMemo(() => buildHistorySections(meals), [meals]);
  const dailyStats = useMemo(() => buildDailyStats(todayMeals, user), [todayMeals, user]);

  const value = useMemo(
    () => ({
      user,
      meals,
      todayMeals,
      historySections,
      dailyStats,
      settings,
      isLoading,
      setUser,
      addMeal,
      updateSettings,
      refreshDaily
    }),
    [user, meals, todayMeals, historySections, dailyStats, settings, isLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
