import React from "react";
import { Image, SectionList, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../src/context/AppContext";
import { Card } from "../../src/components/Card";
import { EmptyState } from "../../src/components/EmptyState";
import {
  getMealCategoryIcon,
  getMealCategoryLabel,
  getMealPortionLabel
} from "../../src/services/calorieEstimator";
import { colors, radii, spacing } from "../../src/theme/design";

const HistoryScreen = () => {
  const { historySections } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {historySections.length === 0 ? (
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center" }}>
          <Card>
            <EmptyState
              title="السجل فارغ حتى الآن"
              description="بعد حفظ أول وجبة ستظهر هنا مجمعة حسب التاريخ مع الصورة والحجم والسعرات."
              icon="time-outline"
            />
          </Card>
        </View>
      ) : (
        <SectionList
          sections={historySections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40, gap: spacing.sm }}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.sm,
                marginTop: spacing.sm
              }}
            >
              <View style={{ alignItems: "flex-end", gap: 2 }}>
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>{section.title}</Text>
                <Text style={{ color: colors.textMuted }}>
                  {section.data.length} وجبة . {section.totalCalories} kcal
                </Text>
              </View>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: radii.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.surfaceStrong
                }}
              >
                <Ionicons name="calendar-outline" size={20} color={colors.white} />
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.sm, gap: spacing.sm }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm }}>
                <Image
                  source={{ uri: item.imageUri }}
                  style={{ width: 82, height: 82, borderRadius: radii.md, backgroundColor: colors.surfaceMuted }}
                />
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "800", color: colors.text }}>
                      {getMealCategoryLabel(item.category)}
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
                        name={getMealCategoryIcon(item.category) as any}
                        size={18}
                        color={colors.primaryStrong}
                      />
                    </View>
                  </View>
                  <Text style={{ color: colors.textMuted, textAlign: "right" }}>
                    {getMealPortionLabel(item.portion)} .{" "}
                    {new Date(item.createdAt).toLocaleTimeString("ar", {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </Text>
                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "800", color: colors.primaryStrong }}>{item.calories} kcal</Text>
                    <Text style={{ color: colors.textSoft, fontSize: 12 }}>
                      {item.estimationSource === "manual-adjustment"
                        ? "تم تعديله يدويًا"
                        : item.estimationSource === "legacy"
                          ? "سجل سابق"
                          : "تقدير موجه"}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

export default HistoryScreen;
