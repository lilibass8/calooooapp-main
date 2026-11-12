import React from "react";
import { Pressable, Text, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "../theme/design";

type ChoiceChipProps = {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  leading?: React.ReactNode;
};

export const ChoiceChip: React.FC<ChoiceChipProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  style,
  leading
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radii.md,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? "#eef7f4" : colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          opacity: pressed ? 0.94 : 1
        },
        style
      ]}
    >
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm }}>
        {leading}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: colors.text, fontWeight: "700", textAlign: "right" }}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "right" }}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};
