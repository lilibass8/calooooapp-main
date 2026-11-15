import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/Card";
import { TextInputField } from "../../src/components/TextInputField";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useApp } from "../../src/context/AppContext";
import { colors, radii, spacing } from "../../src/theme/design";
import { t } from "../../src/i18n";

const SettingsScreen = () => {
  const { user, setUser, dailyStats, signOut, setLanguage, language } = useApp();
  const tx = (key: Parameters<typeof t>[1]) => t(language, key);
  const [weight, setWeight] = useState(user ? String(user.weightKg) : "");
  const [height, setHeight] = useState(user ? String(user.heightCm) : "");
  const [goal, setGoal] = useState(user ? String(user.dailyCalorieGoal) : "");

  useEffect(() => {
    if (!user) return;
    setWeight(String(user.weightKg));
    setHeight(String(user.heightCm));
    setGoal(String(user.dailyCalorieGoal));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const weightNum = Number(weight);
    const heightNum = Number(height);
    const goalNum = Number(goal);
    if (weightNum <= 0 || heightNum <= 0 || goalNum <= 0) return;
    await setUser({
      ...user,
      weightKg: weightNum,
      heightCm: heightNum,
      dailyCalorieGoal: goalNum
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert(tx("unableLogout"), error instanceof Error ? error.message : tx("tryAgain"));
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.lg }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceStrong,
          borderRadius: radii.lg,
          borderCurve: "continuous",
          padding: spacing.xl,
          gap: spacing.lg
        }}
      >
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: radii.pill,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="person-outline" size={28} color={colors.white} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: "rgba(255,255,255,0.74)", textAlign: "right" }}>{tx("healthAccount")}</Text>
            <Text style={{ color: colors.white, fontSize: 24, fontWeight: "800", textAlign: "right" }}>
              {user?.name ?? tx("newUser")}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.78)", textAlign: "right" }}>
              {tx("updateProfile")}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
          {[
            { label: tx("dailyGoal"), value: `${user?.dailyCalorieGoal ?? 0} ${tx("kcal")}` },
            { label: tx("consumed"), value: `${dailyStats.consumed} ${tx("kcal")}` }
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flex: 1,
                padding: spacing.sm,
                borderRadius: radii.md,
                backgroundColor: "rgba(255,255,255,0.12)"
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.72)", textAlign: "right", fontSize: 12 }}>
                {item.label}
              </Text>
              <Text style={{ color: colors.white, textAlign: "right", marginTop: 4, fontWeight: "800" }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Card style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, textAlign: "right" }}>
          {tx("basicDetails")}
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
          {tx("profileDetailsDescription")}
        </Text>
        <TextInputField
          label={tx("weight")}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          helperText={tx("updateWhenChanged")}
        />
        <TextInputField
          label={tx("height")}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          helperText={tx("shownInProfile")}
        />
        <TextInputField
          label={tx("calorieGoal")}
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          helperText={tx("progressBasis")}
        />
        <PrimaryButton
          label={tx("saveChanges")}
          subtitle={tx("updateCurrent")}
          onPress={handleSave}
          icon={<Ionicons name="save-outline" size={18} color={colors.white} />}
        />
        <PrimaryButton
          label={tx("logout")}
          subtitle={tx("logoutDevice")}
          onPress={handleSignOut}
          variant="secondary"
          icon={<Ionicons name="log-out-outline" size={18} color={colors.text} />}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, textAlign: "right" }}>
          {tx("language")}
        </Text>
        <View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
          <PrimaryButton label={tx("arabic")} onPress={() => setLanguage("ar")} variant={language === "ar" ? "primary" : "secondary"} style={{ flex: 1 }} />
          <PrimaryButton label={tx("english")} onPress={() => setLanguage("en")} variant={language === "en" ? "primary" : "secondary"} style={{ flex: 1 }} />
        </View>
      </Card>
    </ScrollView>
  );
};

export default SettingsScreen;
