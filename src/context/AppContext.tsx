import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { DailyStats, Language, Meal, MealHistorySection, Settings, UserProfile } from "../types";
import { storage } from "../storage/storage";
import { remoteData } from "../services/remoteData";
import { supabase } from "../services/supabase";
import { buildDailyStats, buildHistorySections, getTodayMeals, sortMeals } from "../services/meal-utils";

export type AppState = {
  user: UserProfile | null;
  authUser: User | null;
  authReady: boolean;
  meals: Meal[];
  todayMeals: Meal[];
  historySections: MealHistorySection[];
  dailyStats: DailyStats;
  settings: Settings;
  isLoading: boolean;
};

export type AppContextValue = AppState & {
  language: Language;
  setUser: (user: UserProfile) => Promise<void>;
  addMeal: (meal: Meal) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  refreshDaily: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!remoteData.isEnabled);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [settings, setSettingsState] = useState<Settings>({
    darkMode: false,
    notificationsEnabled: true,
    language: "ar"
  });
  const [isLoading, setIsLoading] = useState(true);
  const load = async (authUserId: string) => {
    setIsLoading(true);
    await storage.ensureDailyReset();
    setUserState(null);

    if (remoteData.isEnabled) {
      try {
        const [remoteUser, remoteMeals, remoteSettings, localSettings] = await Promise.all([
          remoteData.getUser(authUserId),
          remoteData.getMeals(authUserId),
          remoteData.getSettings(authUserId),
          storage.getSettings()
        ]);
        const mergedSettings = { ...remoteSettings, language: localSettings.language ?? "ar" };

        const normalizedRemoteMeals = sortMeals(remoteMeals);

        setUserState(remoteUser);
        setMeals(normalizedRemoteMeals);
        setSettingsState(mergedSettings);

        if (remoteUser) {
          await storage.setUser(remoteUser);
        }
        await storage.setMeals(normalizedRemoteMeals);
        await storage.setSettings(mergedSettings);

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
    if (!remoteData.isEnabled || !supabase) {
      setIsLoading(false);
      setAuthReady(true);
      return;
    }

    const client = supabase;
    let active = true;
    const loadSession = async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!active) return;
      const nextAuthUser = data.session?.user ?? null;
      setAuthUser(nextAuthUser);
      setAuthReady(true);
      if (nextAuthUser) {
        await load(nextAuthUser.id);
      } else {
        setUserState(null);
        setMeals([]);
        setIsLoading(false);
      }
    };

    loadSession().catch((error) => {
      console.warn("Failed to load Supabase session:", error);
      if (active) {
        setAuthReady(true);
        setIsLoading(false);
      }
    });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      const nextAuthUser = session?.user ?? null;
      setAuthUser(nextAuthUser);
      if (!nextAuthUser) {
        setUserState(null);
        setMeals([]);
        setIsLoading(false);
        return;
      }
      void load(nextAuthUser.id);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const setUser = async (nextUser: UserProfile) => {
    setUserState(nextUser);
    await storage.setUser(nextUser);

    if (remoteData.isEnabled && authUser) {
      try {
        await remoteData.upsertUser(authUser.id, nextUser);
      } catch (error) {
        console.warn("Failed to save profile to Supabase:", error);
        throw error;
      }
    }
  };

  const addMeal = async (meal: Meal) => {
    await storage.ensureDailyReset();

    let savedMeal = meal;

    if (remoteData.isEnabled && authUser) {
      try {
        savedMeal = await remoteData.createMeal(authUser.id, meal);
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

    if (remoteData.isEnabled && authUser) {
      try {
        await remoteData.upsertSettings(authUser.id, nextSettings);
      } catch (error) {
        console.warn("Failed to save settings to Supabase:", error);
        throw error;
      }
    }
  };

  const setLanguage = async (language: Language) => {
    await updateSettings({ ...settings, language });
  };

  const refreshDaily = async () => {
    if (remoteData.isEnabled && authUser) {
      try {
        const remoteMeals = sortMeals(await remoteData.getMeals(authUser.id));
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

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const todayMeals = useMemo(() => getTodayMeals(meals), [meals]);
  const historySections = useMemo(() => buildHistorySections(meals), [meals]);
  const dailyStats = useMemo(() => buildDailyStats(todayMeals, user), [todayMeals, user]);

  const value = useMemo(
    () => ({
      language: settings.language,
      user,
      authUser,
      authReady,
      meals,
      todayMeals,
      historySections,
      dailyStats,
      settings,
      isLoading,
      setUser,
      addMeal,
      updateSettings,
      setLanguage,
      refreshDaily,
      signOut
    }),
    [user, authUser, authReady, meals, todayMeals, historySections, dailyStats, settings, isLoading]
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
