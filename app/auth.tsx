import React, { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../src/components/Card";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { TextInputField } from "../src/components/TextInputField";
import { colors, radii, spacing } from "../src/theme/design";
import { supabase } from "../src/services/supabase";
import { useApp } from "../src/context/AppContext";
import { t } from "../src/i18n";

const passwordRules = [
  { ar: "8 أحرف على الأقل", en: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { ar: "حرف كبير A-Z", en: "Uppercase letter A-Z", test: (value: string) => /[A-Z]/.test(value) },
  { ar: "حرف صغير a-z", en: "Lowercase letter a-z", test: (value: string) => /[a-z]/.test(value) },
  { ar: "رقم 0-9", en: "Number 0-9", test: (value: string) => /\d/.test(value) },
  { ar: "رمز خاص مثل !@#", en: "Special symbol like !@#", test: (value: string) => /[^A-Za-z0-9]/.test(value) }
];

const getAuthErrorMessage = (message: string) => {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (message.toLowerCase().includes("user already registered")) {
    return "هذا البريد مسجل مسبقًا. جرّب تسجيل الدخول.";
  }
  return message;
};

const AuthScreen = () => {
  const router = useRouter();
  const { authUser, user, isLoading, language } = useApp();
  const tx = (key: Parameters<typeof t>[1]) => t(language, key);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordIsValid = useMemo(
    () => passwordRules.every((rule) => rule.test(password)),
    [password]
  );

  useEffect(() => {
    if (!authUser || isLoading) return;
    router.replace(user ? "/(tabs)/home" : "/onboarding");
  }, [authUser, isLoading, router, user]);

  const handleSubmit = async () => {
    if (!supabase) {
      Alert.alert(tx("missingConfig"), tx("addSupabase"));
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      Alert.alert(tx("checkData"), tx("validEmail"));
      return;
    }
    if (!passwordIsValid) {
      Alert.alert(tx("weakPassword"), tx("passwordRules"));
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      Alert.alert(tx("passwordMismatch"), tx("repeatPassword"));
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password
        });
        if (error) throw error;
        if (!data.session) {
          Alert.alert(
            tx("emailConfirmTitle"),
            tx("emailConfirm")
          );
          setMode("login");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر إكمال العملية";
      Alert.alert(tx("unableContinue"), language === "ar" ? getAuthErrorMessage(message) : message);
    } finally {
      setLoading(false);
    }
  };

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
            paddingHorizontal: spacing.sm,
            gap: spacing.sm
          }}
        >
          <Text style={{ color: colors.text, fontSize: 30, fontWeight: "800", textAlign: language === "ar" ? "right" : "left" }}>
            CalorieSnap
          </Text>
          <Text style={{ color: colors.textMuted, lineHeight: 24, textAlign: language === "ar" ? "right" : "left" }}>
            {tx("authSubtitle")}
          </Text>
        </View>

        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row-reverse", gap: spacing.sm }}>
            <PrimaryButton
              label={tx("login")}
              onPress={() => setMode("login")}
              variant={mode === "login" ? "primary" : "secondary"}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              label={tx("signup")}
              onPress={() => setMode("signup")}
              variant={mode === "signup" ? "primary" : "secondary"}
              style={{ flex: 1 }}
            />
          </View>

          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", textAlign: language === "ar" ? "right" : "left" }}>
            {mode === "login" ? tx("welcomeBack") : tx("createAccount")}
          </Text>

          <TextInputField
            label={tx("email")}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            textAlign="left"
            inputProps={{ autoCapitalize: "none", autoComplete: "email" }}
          />
          <TextInputField
            label={tx("password")}
            value={password}
            onChangeText={setPassword}
            placeholder={tx("strongPassword")}
            inputProps={{ secureTextEntry: true, autoCapitalize: "none", autoComplete: "password" }}
          />

          {mode === "signup" ? (
            <>
              <TextInputField
                label={tx("confirmPassword")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={tx("repeatPassword")}
                inputProps={{ secureTextEntry: true, autoCapitalize: "none", autoComplete: "password" }}
              />
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: "800", textAlign: language === "ar" ? "right" : "left" }}>
                  {language === "ar" ? "متطلبات كلمة المرور" : "Password requirements"}
                </Text>
                {passwordRules.map((rule) => {
                  const valid = rule.test(password);
                  return (
                    <View key={rule.en} style={{ flexDirection: language === "ar" ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
                      <Ionicons
                        name={valid ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={valid ? colors.success : colors.textSoft}
                      />
                      <Text style={{ color: valid ? colors.success : colors.textMuted, textAlign: language === "ar" ? "right" : "left" }}>
                        {language === "ar" ? rule.ar : rule.en}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          <PrimaryButton
            label={loading ? tx("processing") : mode === "login" ? tx("enter") : tx("create")}
            onPress={handleSubmit}
            disabled={loading}
            icon={<Ionicons name={mode === "login" ? "log-in-outline" : "person-add-outline"} size={18} color={colors.white} />}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
