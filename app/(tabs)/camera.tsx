import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Card } from "../../src/components/Card";
import { ChoiceChip } from "../../src/components/ChoiceChip";
import { TextInputField } from "../../src/components/TextInputField";
import {
  estimateCalories,
  getMealCategoryDescription,
  mealCategoryOptions,
  mealPortionOptions
} from "../../src/services/calorieEstimator";
import { useApp } from "../../src/context/AppContext";
import { Meal, MealCategory, MealPortion } from "../../src/types";
import { colors, radii, shadows, spacing } from "../../src/theme/design";

type ScanCategorySelection = MealCategory | "not-food" | null;

const CameraScreen = () => {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScanCategorySelection>(null);
  const [selectedPortion, setSelectedPortion] = useState<MealPortion | null>(null);
  const [estimatedCalories, setEstimatedCalories] = useState<number | null>(null);
  const [caloriesInput, setCaloriesInput] = useState("");
  const [isCaloriesEdited, setIsCaloriesEdited] = useState(false);
  const { addMeal } = useApp();

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    if (!photo?.uri) return;
    setPhotoUri(photo.uri);
    setSelectedCategory(null);
    setSelectedPortion(null);
    setEstimatedCalories(null);
    setCaloriesInput("");
    setIsCaloriesEdited(false);
  };

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedPortion(null);
      setEstimatedCalories(null);
      setCaloriesInput("");
      setIsCaloriesEdited(false);
      return;
    }

    if (selectedCategory === "not-food") {
      setSelectedPortion(null);
      setEstimatedCalories(null);
      setCaloriesInput("");
      setIsCaloriesEdited(false);
      return;
    }

    if (!selectedPortion) {
      setEstimatedCalories(null);
      setCaloriesInput("");
      setIsCaloriesEdited(false);
      return;
    }

    const nextEstimate = estimateCalories(selectedCategory, selectedPortion);
    setEstimatedCalories(nextEstimate);
    setCaloriesInput(String(nextEstimate));
    setIsCaloriesEdited(false);
  }, [selectedCategory, selectedPortion]);

  const resetReview = () => {
    setPhotoUri(null);
    setSelectedCategory(null);
    setSelectedPortion(null);
    setEstimatedCalories(null);
    setCaloriesInput("");
    setIsCaloriesEdited(false);
  };

  const handleAddMeal = async () => {
    if (!photoUri || !selectedCategory || selectedCategory === "not-food" || !selectedPortion) return;
    const calories = Number(caloriesInput);
    if (!calories || calories <= 0) return;

    const meal: Meal = {
      id: `${Date.now()}`,
      calories,
      imageUri: photoUri,
      createdAt: new Date().toISOString(),
      category: selectedCategory,
      portion: selectedPortion,
      estimationSource: isCaloriesEdited ? "manual-adjustment" : "preset"
    };
    await addMeal(meal);
    resetReview();
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>جاري تجهيز الكاميرا...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background }}>
        <Card style={{ gap: spacing.md }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: radii.pill,
              backgroundColor: colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center"
            }}
          >
            <Ionicons name="camera-outline" size={28} color={colors.primaryStrong} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" }}>
            نحتاج إذن الكاميرا
          </Text>
          <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22 }}>
            حتى نسمح لك بتصوير الوجبات ثم مراجعتها قبل تسجيل السعرات داخل يومك.
          </Text>
          <PrimaryButton label="تفعيل الكاميرا" onPress={requestPermission} />
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {photoUri ? (
        <ScrollView
          style={{ flex: 1 }}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator
          alwaysBounceVertical
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 140,
            gap: spacing.lg,
            flexGrow: 1
          }}
        >
          <View style={{ gap: spacing.md }}>
            <Image
              source={{ uri: photoUri }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: radii.lg,
                backgroundColor: colors.surfaceMuted
              }}
            />
            <Card muted style={{ gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: "800", textAlign: "right" }}>
                راجع الصورة قبل الحفظ
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                التطبيق لن يعطي أي سعرات من الصورة وحدها. لازم تحدد إذا كانت الصورة طعامًا
                فعلاً، ثم تختار الفئة الغذائية والحجم.
              </Text>
            </Card>
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" }}>
              هل ما في الصورة شيء يؤكل؟
            </Text>
            <ChoiceChip
              title="ليست مادة غذائية"
              subtitle="مثل مفتاح، جهاز، كوب فارغ، أدوات أو أي عنصر غير مأكول"
              selected={selectedCategory === "not-food"}
              onPress={() => setSelectedCategory("not-food")}
              leading={<Ionicons name="close-circle-outline" size={22} color={colors.danger} />}
            />
            <View style={{ gap: spacing.sm }}>
              {mealCategoryOptions.map((option) => (
                <ChoiceChip
                  key={option.value}
                  title={option.label}
                  subtitle={option.description}
                  selected={selectedCategory === option.value}
                  onPress={() => setSelectedCategory(option.value)}
                  leading={
                    <Ionicons name={option.icon as any} size={20} color={colors.primaryStrong} />
                  }
                />
              ))}
            </View>
          </Card>

          {selectedCategory === "not-food" ? (
            <Card muted style={{ gap: spacing.md }}>
              <Text style={{ color: colors.danger, fontWeight: "800", textAlign: "right" }}>
                لن يتم احتساب سعرات لهذه الصورة
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                بما أنك حددت أن العنصر ليس طعامًا، فلن نعرض أي سعرات أو نحفظه ضمن السجل.
                يمكنك إعادة التصوير عند وجود وجبة فعلية.
              </Text>
              <PrimaryButton
                label="إعادة التصوير"
                onPress={resetReview}
                variant="secondary"
                icon={<Ionicons name="camera-reverse-outline" size={18} color={colors.text} />}
              />
            </Card>
          ) : null}

          {selectedCategory && selectedCategory !== "not-food" ? (
            <>
              <Card style={{ gap: spacing.md }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" }}>
                    حجم الوجبة
                  </Text>
                  <Text style={{ color: colors.textMuted, textAlign: "right" }}>
                    {getMealCategoryDescription(selectedCategory)}
                  </Text>
                </View>
                <View style={{ gap: spacing.sm }}>
                  {mealPortionOptions.map((portion) => (
                    <ChoiceChip
                      key={portion.value}
                      title={portion.label}
                      subtitle={portion.description}
                      selected={selectedPortion === portion.value}
                      onPress={() => setSelectedPortion(portion.value)}
                    />
                  ))}
                </View>
              </Card>

              <Card style={{ gap: spacing.md }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" }}>
                    تقدير السعرات
                  </Text>
                  <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                    نملأ الحقل بتقدير افتراضي حسب الفئة والحجم، ويمكنك تعديله إذا لزم.
                  </Text>
                </View>

                <TextInputField
                  label="السعرات"
                  value={caloriesInput}
                  onChangeText={(value) => {
                    setCaloriesInput(value);
                    setIsCaloriesEdited(true);
                  }}
                  keyboardType="numeric"
                  placeholder={selectedPortion ? "مثال: 550" : "اختر الحجم أولًا"}
                  editable={Boolean(selectedPortion)}
                  helperText={
                    estimatedCalories !== null
                      ? `التقدير الافتراضي: ${estimatedCalories} kcal`
                      : "لن يظهر أي رقم حتى تختار حجم الوجبة."
                  }
                />

                <View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
                  <PrimaryButton
                    label="إضافة إلى يومي"
                    subtitle="حفظ الصورة والفئة والسعرات"
                    onPress={handleAddMeal}
                    disabled={!selectedPortion || !caloriesInput}
                    style={{ flex: 1 }}
                    icon={<Ionicons name="add-circle-outline" size={18} color={colors.white} />}
                  />
                  <PrimaryButton
                    label="إعادة التصوير"
                    onPress={resetReview}
                    variant="secondary"
                    style={{ flex: 1 }}
                    icon={<Ionicons name="camera-reverse-outline" size={18} color={colors.text} />}
                  />
                </View>
              </Card>
            </>
          ) : null}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <CameraView ref={cameraRef} style={{ flex: 1 }} />
          <View
            style={{
              position: "absolute",
              left: spacing.lg,
              right: spacing.lg,
              bottom: spacing.xxl,
              gap: spacing.md
            }}
          >
            <Card
              style={{
                backgroundColor: "rgba(255, 253, 249, 0.92)",
                gap: spacing.sm
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "800", textAlign: "right" }}>
                صوّر الوجبة بوضوح
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                صوّر الطعام نفسه فقط. إذا كانت الصورة لشيء غير مأكول فلن نعرض أي سعرات أو نحفظ
                النتيجة.
              </Text>
            </Card>
            <View style={{ alignItems: "center", gap: spacing.sm }}>
              <Pressable
                onPress={handleTakePhoto}
                style={({ pressed }) => ({
                  width: 84,
                  height: 84,
                  borderRadius: radii.pill,
                  backgroundColor: colors.white,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 8,
                  borderColor: colors.accent,
                  opacity: pressed ? 0.9 : 1,
                  boxShadow: shadows.strong
                })}
              >
                <Ionicons name="camera" size={30} color={colors.primaryStrong} />
              </Pressable>
              <Text style={{ color: colors.white, fontWeight: "700" }}>التقاط صورة</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CameraScreen;
