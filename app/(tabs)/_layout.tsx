import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "../../src/theme/design";

const TabIcon = ({
  name,
  color,
  focused
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) => {
  return (
    <View
      style={{
        minWidth: 44,
        height: 36,
        borderRadius: radii.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? "rgba(31, 111, 95, 0.12)" : "transparent"
      }}
    >
      <Ionicons
        name={name}
        size={22}
        color={focused ? colors.primaryStrong : color}
      />
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundAlt },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "800",
          color: colors.text
        },
        headerTitleAlign: "center",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarStyle: {
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg,
          marginHorizontal: 14,
          marginBottom: 10,
          position: "absolute",
          boxShadow: shadows.card
        },
        tabBarItemStyle: {
          paddingTop: 4
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "الرئيسية",
          headerTitle: "لوحة اليوم",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color as string} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "المسح",
          headerTitle: "مسح الوجبة",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="camera" color={color as string} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "السجل",
          headerTitle: "سجل الوجبات",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="time-outline" color={color as string} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الحساب",
          headerTitle: "الإعدادات",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-outline" color={color as string} focused={focused} />
          )
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
