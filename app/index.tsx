import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../src/context/AppContext";
import { colors } from "../src/theme/design";
import { t } from "../src/i18n";

const Index = () => {
  const router = useRouter();
  const { user, authUser, authReady, isLoading, language } = useApp();

  useEffect(() => {
    if (!authReady || isLoading) return;
    if (!authUser) {
      router.replace("/auth");
    } else if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/onboarding");
    }
  }, [authReady, authUser, isLoading, user, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        gap: 14
      }}
    >
      <ActivityIndicator size="large" color={colors.primaryStrong} />
      <Text style={{ color: colors.text, fontWeight: "700" }}>{t(language, "appLoading")}</Text>
    </View>
  );
};

export default Index;
