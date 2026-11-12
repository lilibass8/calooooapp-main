import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_PROFILE_KEY = "caloriesnap:profileId";

const generateProfileId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  return `device-${Date.now()}-${random}`;
};

export const getOrCreateProfileId = async (): Promise<string> => {
  const existing = await AsyncStorage.getItem(DEVICE_PROFILE_KEY);
  if (existing) return existing;

  const nextId = generateProfileId();
  await AsyncStorage.setItem(DEVICE_PROFILE_KEY, nextId);
  return nextId;
};
