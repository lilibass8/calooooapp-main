import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../src/context/AppContext";
import { Card } from "../src/components/Card";
import { TextInputField } from "../src/components/TextInputField";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors, radii, spacing } from "../src/theme/design";

const OnboardingScreen = () => {
  const router = useRouter();
  const { user, setUser } = useApp();
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/home");
    }
  }, [user, router]);

  const isValid = () => {
    return (
      name.trim().length > 0 &&
      Number(weight) > 0 &&
      Number(height) > 0 &&
      Number(goal) > 0
    );
  };

  const handleContinue = async () => {
    if (!isValid()) return;
    await setUser({
      name: name.trim(),
      weightKg: Number(weight),
      heightCm: Number(height),
      dailyCalorieGoal: Number(goal)
    });
    router.replace("/(tabs)/home");
  };

  const previewGoal = Number(goal) > 0 ? Number(goal) : 2100;
  const previewWeight = Number(weight) > 0 ? Number(weight) : 68;
  const previewHeight = Number(height) > 0 ? Number(height) : 172;

  const highlights = [
    "خطوات سريعة وواضحة",
    "واجهة عربية مركزة",
    "تتبع يومي بدون تعقيد"
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
        <View
          style={{
            backgroundColor: colors.primaryStrong,
            borderRadius: radii.lg,
            borderCurve: "continuous",
            padding: spacing.xl,
            overflow: "hidden",
            gap: spacing.lg
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: radii.pill,
              backgroundColor: "rgba(255,255,255,0.08)",
              top: -30,
              left: -40
            }}
          />
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.pill,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="sparkles-outline" size={30} color={colors.white} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text style={{ fontSize: 30, fontWeight: "800", color: colors.white, textAlign: "right" }}>
              ابدأ رحلتك الصحية
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.82)",
                lineHeight: 24,
                textAlign: "right",
                fontSize: 15
              }}
            >
              CalorieSnap يساعدك على تسجيل وجباتك يوميًا بشكل أنيق وسهل، مع تدفق مسح يمنع
              النتائج الوهمية ويخليك أقرب لهدفك.
            </Text>
          </View>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.xs }}>
            {highlights.map((item) => (
              <View
                key={item}
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 8,
                  borderRadius: radii.pill,
                  backgroundColor: "rgba(255,255,255,0.14)"
                }}
              >
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: "700" }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <Card style={{ gap: spacing.md }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "right" }}>
              خلّنا نجهز حسابك
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
              أدخل بياناتك الأساسية حتى نعرض لك ملخصًا يوميًا أوضح ونبني لوحة تناسب هدفك.
            </Text>
          </View>

          <TextInputField
            label="الاسم"
            value={name}
            onChangeText={setName}
            placeholder="مثال: أحمد"
            helperText="سيظهر الاسم في التحية الرئيسية داخل التطبيق."
          />
          <TextInputField
            label="الوزن (كجم)"
            value={weight}
            onChangeText={setWeight}
            placeholder="68"
            keyboardType="numeric"
            helperText="نستخدمه لعرض ملفك الصحي فقط."
          />
          <TextInputField
            label="الطول (سم)"
            value={height}
            onChangeText={setHeight}
            placeholder="172"
            keyboardType="numeric"
            helperText="سيظهر ضمن ملخصك في صفحة الحساب."
          />
          <TextInputField
            label="هدف السعرات اليومي"
            value={goal}
            onChangeText={setGoal}
            placeholder="2100"
            keyboardType="numeric"
            helperText="هذا الرقم سيحدد مؤشر التقدّم اليومي في الرئيسية."
          />
        </Card>

        <Card muted style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radii.pill,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="bar-chart-outline" size={20} color={colors.primaryStrong} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.text, fontWeight: "800", textAlign: "right" }}>
                معاينة ملفك اليومي
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: "right" }}>
                ستظهر هذه الأرقام بشكل حي بعد تسجيل الوجبات.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm }}>
            {[
              { label: "الهدف", value: `${previewGoal} kcal` },
              { label: "الوزن", value: `${previewWeight} كجم` },
              { label: "الطول", value: `${previewHeight} سم` }
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  width: "48%",
                  padding: spacing.sm,
                  borderRadius: radii.md,
                  backgroundColor: colors.surface
                }}
              >
                <Text style={{ color: colors.textSoft, fontSize: 12, textAlign: "right" }}>{item.label}</Text>
                <Text style={{ color: colors.text, fontWeight: "800", marginTop: 4, textAlign: "right" }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <PrimaryButton
            label="ابدأ التتبع"
            subtitle="إنشاء تجربتك العربية الجديدة"
            onPress={handleContinue}
            disabled={!isValid()}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;
