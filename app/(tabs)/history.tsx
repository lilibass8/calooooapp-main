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
import { t } from "../../src/i18n";

const HistoryScreen = () => {
  const { historySections, language } = useApp();
  const tx = (key: Parameters<typeof t>[1]) => t(language, key);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {historySections.length === 0 ? (
        <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center" }}>
          <Card>
            <EmptyState
              title={tx("emptyHistory")}
              description={tx("emptyHistoryDescription")}
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
                <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>
                  {section.key === "unknown"
                    ? language === "ar" ? "سجلات غير معروفة التاريخ" : "Records with unknown date"
                    : new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
                        weekday: "long",
                        day: "numeric",
                        month: "long"
                      }).format(new Date(section.data[0].createdAt))}
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  {section.data.length} {section.data.length === 1 ? tx("meal") : tx("mealsCount")} . {section.totalCalories} {tx("kcal")}
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
                      {getMealCategoryLabel(item.category, language)}
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
                    {getMealPortionLabel(item.portion, language)} .{" "}
                    {new Date(item.createdAt).toLocaleTimeString(language === "ar" ? "ar" : "en", {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </Text>
                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "800", color: colors.primaryStrong }}>{item.calories} {tx("kcal")}</Text>
                    <Text style={{ color: colors.textSoft, fontSize: 12 }}>
                      {item.estimationSource === "manual-adjustment"
                        ? tx("manuallyAdjusted")
                        : item.estimationSource === "legacy"
                          ? tx("previousRecord")
                          : tx("guidedEstimate")}
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
