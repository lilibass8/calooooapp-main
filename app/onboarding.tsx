import React, { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../src/context/AppContext";
import { Card } from "../src/components/Card";
import { TextInputField } from "../src/components/TextInputField";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors, radii, spacing } from "../src/theme/design";
import { t } from "../src/i18n";

const OnboardingScreen = () => {
  const router = useRouter();
  const { user, setUser, language } = useApp();
  const tx = (key: Parameters<typeof t>[1]) => t(language, key);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) router.replace("/(tabs)/home");
  }, [user, router]);

  const isValid = useMemo(
    () => name.trim().length > 0 && Number(weight) > 0 && Number(height) > 0 && Number(goal) > 0,
    [name, weight, height, goal]
  );

  const handleContinue = () => {
    if (isValid) setStep(2);
  };

  const handleConfirm = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      await setUser({
        name: name.trim(),
        weightKg: Number(weight),
        heightCm: Number(height),
        dailyCalorieGoal: Number(goal)
      });
      router.replace("/(tabs)/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : tx("unableSave");
      Alert.alert(tx("unableSave"), `${message}\n\n${language === "ar" ? "تأكد من تطبيق ملف Supabase migration ثم أعد المحاولة." : "Make sure the Supabase migration is applied, then try again."}`);
    } finally {
      setIsSaving(false);
    }
  };

  const summaryItems = [
    { label: tx("name"), value: name.trim() },
    { label: tx("weight"), value: `${weight} ${tx("kg")}` },
    { label: tx("height"), value: `${height} ${tx("cm")}` },
    { label: tx("calorieGoal"), value: `${goal} ${tx("kcal")}` }
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.lg }}
      >
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radii.pill,
                  backgroundColor: colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="sparkles-outline" size={23} color={colors.accent} />
              </View>
              <View>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "right" }}>
                  {tx("setupQuick")}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "right" }}>
                  {tx("dataThenReview")}
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700" }}>{step}/2</Text>
          </View>

          <View style={{ flexDirection: "row-reverse", gap: spacing.xs }} accessibilityLabel={`الخطوة ${step} من 2`}>
            {[1, 2].map((item) => (
              <View key={item} style={{ flex: 1, gap: 6 }}>
                <View
                  style={{
                    height: 6,
                    borderRadius: radii.pill,
                    backgroundColor: item <= step ? colors.accent : colors.border
                  }}
                />
                <Text
                  style={{
                    color: item === step ? colors.text : colors.textSoft,
                    fontSize: 11,
                    fontWeight: item === step ? "800" : "600",
                    textAlign: "right"
                  }}
                >
                  {item === 1 ? tx("enterData") : tx("reviewApprove")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {step === 1 ? (
          <>
            <Card style={{ gap: spacing.md }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", textAlign: "right" }}>
                  {tx("prepareAccount")}
                </Text>
                <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                  {tx("basicDataStart")}
                </Text>
              </View>

              <TextInputField label={tx("name")} value={name} onChangeText={setName} placeholder={tx("namePlaceholder")} />
              <TextInputField
                label={tx("weight")}
                value={weight}
                onChangeText={setWeight}
                placeholder="68"
                keyboardType="numeric"
              />
              <TextInputField
                label={tx("height")}
                value={height}
                onChangeText={setHeight}
                placeholder="172"
                keyboardType="numeric"
              />
              <TextInputField
                label={tx("calorieGoal")}
                value={goal}
                onChangeText={setGoal}
                placeholder="2100"
                keyboardType="numeric"
              />
            </Card>

            <PrimaryButton
              label={tx("next")}
              subtitle={tx("reviewBeforeApprove")}
              onPress={handleContinue}
              disabled={!isValid}
              backgroundColor={colors.accent}
            />
          </>
        ) : (
          <>
            <Card style={{ gap: spacing.md }}>
              <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radii.pill,
                    backgroundColor: colors.accentSoft,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="checkmark-outline" size={30} color={colors.accent} />
                </View>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", textAlign: "center" }}>
                  {tx("reviewData")}
                </Text>
                <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22 }}>
                  {tx("confirmBeforeSave")}
                </Text>
              </View>

              <View style={{ gap: spacing.sm }}>
                {summaryItems.map((item) => (
                  <View
                    key={item.label}
                    style={{
                      flexDirection: "row-reverse",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: spacing.md,
                      borderRadius: radii.md,
                      backgroundColor: colors.backgroundAlt,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <Text style={{ color: colors.textMuted, textAlign: "right" }}>{item.label}</Text>
                    <Text style={{ color: colors.text, fontWeight: "800", textAlign: "right" }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <PrimaryButton
              label={isSaving ? tx("saving") : tx("approveStart")}
              onPress={handleConfirm}
              disabled={isSaving}
              backgroundColor={colors.accent}
            />
            <PrimaryButton label={tx("editData")} onPress={() => setStep(1)} variant="ghost" disabled={isSaving} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;
