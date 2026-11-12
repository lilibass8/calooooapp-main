import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../src/components/Card";
import { TextInputField } from "../../src/components/TextInputField";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useApp } from "../../src/context/AppContext";
import { colors, radii, spacing } from "../../src/theme/design";

const SettingsScreen = () => {
  const { user, setUser, dailyStats } = useApp();
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
            <Text style={{ color: "rgba(255,255,255,0.74)", textAlign: "right" }}>الحساب الصحي</Text>
            <Text style={{ color: colors.white, fontSize: 24, fontWeight: "800", textAlign: "right" }}>
              {user?.name ?? "مستخدم جديد"}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.78)", textAlign: "right" }}>
              عدّل بياناتك الأساسية ليبقى هدفك اليومي دقيقًا.
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
          {[
            { label: "الهدف اليومي", value: `${user?.dailyCalorieGoal ?? 0} kcal` },
            { label: "استهلاك اليوم", value: `${dailyStats.consumed} kcal` }
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
          البيانات الأساسية
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
          هذه القيم تُستخدم في الواجهة فقط لإظهار ملفك الصحي وتقدّمك نحو الهدف.
        </Text>
        <TextInputField
          label="الوزن (كجم)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          helperText="يمكنك تحديثه متى ما تغيّر وزنك."
        />
        <TextInputField
          label="الطول (سم)"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          helperText="يظهر ضمن ملخص حسابك الصحي."
        />
        <TextInputField
          label="هدف السعرات اليومي"
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          helperText="هو الرقم الذي نبني عليه مؤشر التقدّم اليومي."
        />
        <PrimaryButton
          label="حفظ التعديلات"
          subtitle="تحديث بياناتك الحالية"
          onPress={handleSave}
          icon={<Ionicons name="save-outline" size={18} color={colors.white} />}
        />
      </Card>
    </ScrollView>
  );
};

export default SettingsScreen;
