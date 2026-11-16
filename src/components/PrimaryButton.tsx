import React from "react";
import { Pressable, Text, View, ViewStyle } from "react-native";
import { colors, radii, shadows, spacing } from "../theme/design";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  style,
  disabled,
  backgroundColor,
  textColor,
  subtitle,
  icon,
  variant = "primary"
}) => {
  const variants = {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.white,
      borderColor: colors.primary,
      boxShadow: shadows.strong
    },
    secondary: {
      backgroundColor: colors.surface,
      textColor: colors.text,
      borderColor: colors.border,
      boxShadow: shadows.soft
    },
    ghost: {
      backgroundColor: "transparent",
      textColor: colors.text,
      borderColor: colors.border,
      boxShadow: undefined
    }
  } as const;

  const resolvedBackground = backgroundColor ?? variants[variant].backgroundColor;
  const resolvedText = textColor ?? variants[variant].textColor;
  const resolvedBorder = variant === "ghost" ? colors.border : variants[variant].borderColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? "#d7d2c8" : resolvedBackground,
          paddingVertical: subtitle ? 12 : 14,
          paddingHorizontal: spacing.lg,
          borderRadius: radii.md,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: disabled ? "#d7d2c8" : resolvedBorder,
          opacity: pressed ? 0.92 : 1,
          boxShadow: disabled ? undefined : variants[variant].boxShadow
        },
        style
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {icon}
        <View style={{ alignItems: "center", gap: 2 }}>
          <Text
            style={{ color: resolvedText, fontWeight: "700", fontSize: 16, textAlign: "center" }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {label}
          </Text>
          {subtitle ? (
            <Text
              style={{ color: resolvedText, opacity: 0.72, fontSize: 12, textAlign: "center" }}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};
