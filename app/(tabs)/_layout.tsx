import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

import AppHeader from "@/components/common/AppHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { colors } = useAppTheme();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Sau hooks mới được return
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Header dùng chung cho toàn bộ Tabs */}
      <AppHeader />

      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: "#1976E9",
          tabBarInactiveTintColor: colors.textSecondary,

          tabBarStyle: {
            height: 70,

            paddingTop: 6,
            paddingBottom: 8,

            backgroundColor: colors.surface,

            borderTopWidth: 1,
            borderTopColor: colors.border,
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="tasks"
          options={{
            title: t("tabs.tasks"),

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "create" : "create-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="menu"
          options={{
            title: t("tabs.menu"),

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: t("tabs.notifications"),

            tabBarBadge: 3,

            tabBarBadgeStyle: {
              backgroundColor: "#FF4D4F",
              color: "#FFFFFF",
            },

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
