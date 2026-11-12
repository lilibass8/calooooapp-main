import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing } from "../theme/design";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = "sparkles-outline"
}) => {
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm }}>
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: radii.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentSoft
        }}
      >
        <Ionicons name={icon} size={26} color={colors.primaryStrong} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center" }}>
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textMuted,
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 22
        }}
      >
        {description}
      </Text>
    </View>
  );
};
