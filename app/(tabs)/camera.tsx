import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
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
import { t } from "../../src/i18n";

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
  const { addMeal, language } = useApp();
  const tx = (key: Parameters<typeof t>[1]) => t(language, key);

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
    try {
      await addMeal(meal);
      resetReview();
    } catch (error) {
      const message = error instanceof Error ? error.message : tx("unableSave");
      Alert.alert(tx("unableSave"), `${message}\n\n${language === "ar" ? "تأكد من إعداد جداول Supabase و bucket الصور." : "Check your Supabase tables and image bucket setup."}`);
    }
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{tx("cameraPreparing")}</Text>
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
            {tx("cameraPermissionTitle")}
          </Text>
          <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22 }}>
            {tx("cameraPermissionDescription")}
          </Text>
          <PrimaryButton label={tx("enableCamera")} onPress={requestPermission} />
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
                {tx("reviewPhoto")}
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                {tx("photoRules")}
              </Text>
            </Card>
          </View>

          <Card style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" }}>
              {tx("edibleQuestion")}
            </Text>
            <ChoiceChip
              title={tx("notFood")}
              subtitle={tx("notFoodDescription")}
              selected={selectedCategory === "not-food"}
              onPress={() => setSelectedCategory("not-food")}
              leading={<Ionicons name="close-circle-outline" size={22} color={colors.danger} />}
            />
            <View style={{ gap: spacing.sm }}>
              {mealCategoryOptions.map((option) => (
                <ChoiceChip
                  key={option.value}
                  title={language === "ar" ? option.label : option.labelEn}
                  subtitle={language === "ar" ? option.description : option.descriptionEn}
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
                {tx("noCalories")}
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                {tx("noCaloriesDescription")}
              </Text>
              <PrimaryButton
                label={tx("retake")}
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
                    {tx("mealSize")}
                  </Text>
                  <Text style={{ color: colors.textMuted, textAlign: "right" }}>
                    {getMealCategoryDescription(selectedCategory, language)}
                  </Text>
                </View>
                <View style={{ gap: spacing.sm }}>
                  {mealPortionOptions.map((portion) => (
                    <ChoiceChip
                      key={portion.value}
                      title={language === "ar" ? portion.label : portion.labelEn}
                      subtitle={language === "ar" ? portion.description : portion.descriptionEn}
                      selected={selectedPortion === portion.value}
                      onPress={() => setSelectedPortion(portion.value)}
                    />
                  ))}
                </View>
              </Card>

              <Card style={{ gap: spacing.md }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "right" }}>
                    {tx("calorieEstimate")}
                  </Text>
                  <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                    {tx("defaultEstimate")}
                  </Text>
                </View>

                <TextInputField
                  label={tx("calories")}
                  value={caloriesInput}
                  onChangeText={(value) => {
                    setCaloriesInput(value);
                    setIsCaloriesEdited(true);
                  }}
                  keyboardType="numeric"
                  placeholder={selectedPortion ? tx("exampleCalories") : tx("chooseSizeFirst")}
                  editable={Boolean(selectedPortion)}
                  helperText={
                    estimatedCalories !== null
                      ? `${tx("defaultEstimateLabel")}: ${estimatedCalories} ${tx("kcal")}`
                      : tx("chooseSizeMessage")
                  }
                />

                <View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
                  <PrimaryButton
                    label={tx("addToToday")}
                    subtitle={tx("saveMealDetails")}
                    onPress={handleAddMeal}
                    disabled={!selectedPortion || !caloriesInput}
                    style={{ flex: 1 }}
                    icon={<Ionicons name="add-circle-outline" size={18} color={colors.white} />}
                  />
                  <PrimaryButton
                    label={tx("retake")}
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
                {tx("takePhotoClearly")}
              </Text>
              <Text style={{ color: colors.textMuted, textAlign: "right", lineHeight: 22 }}>
                {tx("photoOnlyFood")}
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
              <Text style={{ color: colors.white, fontWeight: "700" }}>{tx("capturePhoto")}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CameraScreen;
