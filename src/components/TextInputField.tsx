import React from "react";
import { Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "../theme/design";
import { useApp } from "../context/AppContext";

type TextInputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  style?: ViewStyle;
  helperText?: string;
  editable?: boolean;
  textAlign?: "left" | "right" | "center";
  inputProps?: Omit<TextInputProps, "value" | "onChangeText" | "placeholder" | "keyboardType">;
};

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  style,
  helperText,
  editable = true,
  textAlign = "right",
  inputProps
}) => {
  const { language } = useApp();
  const resolvedTextAlign = textAlign ?? (language === "ar" ? "right" : "left");
  return (
    <View style={[{ gap: 8 }, style]}>
      <Text
        style={{
          fontWeight: "700",
          color: colors.text,
          textAlign: resolvedTextAlign
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={editable}
        placeholderTextColor={colors.textSoft}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          borderCurve: "continuous",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: editable ? colors.white : colors.surfaceMuted,
          fontSize: 16,
          color: colors.text,
          textAlign: resolvedTextAlign,
          writingDirection: resolvedTextAlign === "right" ? "rtl" : "ltr"
        }}
        {...inputProps}
      />
      {helperText ? (
        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "right" }}>{helperText}</Text>
      ) : null}
    </View>
  );
};
