import AppHeader from "@/components/common/AppHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const unseenCount = useNotificationStore((state) => state.unseenCount);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications,
  );

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchNotifications();
    }
  }, [isInitialized, isAuthenticated, fetchNotifications]);

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
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
            tabBarBadge: unseenCount > 0 ? unseenCount : undefined,
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
