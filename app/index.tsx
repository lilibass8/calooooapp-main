import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useApp } from "../src/context/AppContext";
import { colors } from "../src/theme/design";

const Index = () => {
  const router = useRouter();
  const { user, isLoading } = useApp();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/onboarding");
    }
  }, [isLoading, user, router]);

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
      <Text style={{ color: colors.text, fontWeight: "700" }}>جاري تجهيز تجربتك الصحية...</Text>
    </View>
  );
};

export default Index;
