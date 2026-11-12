import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../src/context/AppContext";
import { Card } from "../../src/components/Card";
import { ProgressBar } from "../../src/components/ProgressBar";
import { EmptyState } from "../../src/components/EmptyState";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import {
  getMealCategoryIcon,
  getMealCategoryLabel,
  getMealPortionLabel
} from "../../src/services/calorieEstimator";
import { colors, radii, spacing } from "../../src/theme/design";

const HomeScreen = () => {
  const router = useRouter();
  const { user, todayMeals, dailyStats, refreshDaily } = useApp();

  useFocusEffect(
    useCallback(() => {
      refreshDaily();
    }, [refreshDaily])
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
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
            width: 200,
            height: 200,
            borderRadius: radii.pill,
            backgroundColor: "rgba(255,255,255,0.07)",
            right: -20,
            top: -60
          }}
        />
        <View style={{ gap: 4 }}>
          <Text style={{ color: "rgba(255,255,255,0.74)", textAlign: "right", fontSize: 13 }}>
            أهلاً بعودتك
          </Text>
          <Text style={{ color: colors.white, fontSize: 30, fontWeight: "800", textAlign: "right" }}>
            {user?.name ?? "ضيفنا الصحي"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.78)", textAlign: "right", lineHeight: 22 }}>
            ملخصك اليومي أصبح أوضح: وجبات اليوم، التقدّم نحو الهدف، وآخر الوجبات المسجلة في
            مكان واحد.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ color: colors.white, fontSize: 28, fontWeight: "800" }}>
              {dailyStats.goal} kcal
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.82)", textAlign: "right" }}>هدفك اليومي</Text>
          </View>
          <ProgressBar progress={dailyStats.progress} />
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between" }}>
            <Text style={{ color: "rgba(255,255,255,0.78)" }}>
              استهلكت {dailyStats.consumed} kcal
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.78)" }}>
              المتبقي {dailyStats.remaining} kcal
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm }}>
        {[
          { label: "الهدف", value: `${dailyStats.goal}`, icon: "flag-outline" },
          { label: "المستهلك", value: `${dailyStats.consumed}`, icon: "flame-outline" },
          { label: "المتبقي", value: `${dailyStats.remaining}`, icon: "sparkles-outline" },
          { label: "الوجبات", value: `${dailyStats.mealCount}`, icon: "restaurant-outline" }
        ].map((item) => (
          <Card key={item.label} style={{ width: "48%", gap: 10 }}>
            <Ionicons name={item.icon as any} size={18} color={colors.primaryStrong} />
            <Text style={{ color: colors.textSoft, fontSize: 12, textAlign: "right" }}>{item.label}</Text>
            <Text
              style={{
                color: colors.text,
                fontWeight: "800",
                fontSize: 18,
                textAlign: "right",
                fontVariant: ["tabular-nums"]
              }}
            >
              {item.value}
            </Text>
          </Card>
        ))}
      </View>

      <Card style={{ gap: spacing.md }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "right" }}>
            ابدأ تسجيل وجبة جديدة
          </Text>
          <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
            صوّر وجبتك، حدّد نوعها وحجمها، ثم احفظها مباشرة داخل سجل اليوم.
          </Text>
        </View>
        <PrimaryButton
          label="فتح شاشة المسح"
          subtitle="تصوير ومراجعة ثم حفظ"
          onPress={() => router.push("/(tabs)/camera")}
          icon={<Ionicons name="camera-outline" size={18} color={colors.white} />}
        />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "right" }}>
            وجبات اليوم
          </Text>
          <Text style={{ color: colors.textMuted, textAlign: "right" }}>
            آخر ثلاث وجبات سجلتها اليوم تظهر هنا سريعًا.
          </Text>
        </View>
        {todayMeals.length === 0 ? (
          <EmptyState
            title="لا توجد وجبات اليوم"
            description="التقط أول وجبة وسيظهر ملخصها هنا مع الفئة والحجم والسعرات."
            icon="camera-outline"
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {todayMeals.slice(0, 3).map((meal) => (
              <View
                key={meal.id}
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: spacing.sm,
                  padding: spacing.sm,
                  borderRadius: radii.md,
                  backgroundColor: colors.backgroundAlt
                }}
              >
                <Image
                  source={{ uri: meal.imageUri }}
                  style={{ width: 72, height: 72, borderRadius: radii.sm, backgroundColor: colors.surfaceMuted }}
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: colors.text, fontWeight: "800" }}>
                      {getMealCategoryLabel(meal.category)}
                    </Text>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: radii.pill,
                        backgroundColor: colors.accentSoft,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Ionicons
                        name={getMealCategoryIcon(meal.category) as any}
                        size={18}
                        color={colors.primaryStrong}
                      />
                    </View>
                  </View>
                  <Text style={{ color: colors.textMuted, textAlign: "right" }}>
                    {getMealPortionLabel(meal.portion)} .{" "}
                    {new Date(meal.createdAt).toLocaleTimeString("ar", {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </Text>
                  <Text style={{ color: colors.primaryStrong, fontWeight: "800", textAlign: "right" }}>
                    {meal.calories} kcal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

export default HomeScreen;
