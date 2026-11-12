import React from "react";
import { View } from "react-native";
import { colors, radii } from "../theme/design";

type ProgressBarProps = {
  progress: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const width = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <View
      style={{
        height: 12,
        backgroundColor: colors.accentSoft,
        borderRadius: radii.pill,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#f2d8bd"
      }}
    >
      <View
        style={{
          width: `${width}%`,
          backgroundColor: colors.primary,
          height: "100%",
          borderRadius: radii.pill
        }}
      />
    </View>
  );
};
