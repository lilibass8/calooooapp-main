import React from "react";
import { View, ViewStyle } from "react-native";
import { colors, radii, shadows, spacing } from "../theme/design";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  muted?: boolean;
  elevated?: boolean;
};

export const Card: React.FC<CardProps> = ({ children, style, muted, elevated = true }) => {
  return (
    <View
      style={{
        backgroundColor: muted ? colors.surfaceMuted : colors.surface,
        borderRadius: radii.md,
        borderCurve: "continuous",
        padding: spacing.md,
        borderWidth: 1,
        borderColor: muted ? colors.accentSoft : colors.border,
        boxShadow: elevated ? shadows.card : undefined,
        ...style
      }}
    >
      {children}
    </View>
  );
};
