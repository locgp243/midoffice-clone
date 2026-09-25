import AppHeader from "@/components/common/AppHeader";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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

  const bottomInset = Math.max(insets.bottom, 8);

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

          sceneStyle: {
            backgroundColor: colors.background,
          },

          tabBarActiveTintColor: "#1976E9",
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarHideOnKeyboard: true,

          tabBarStyle: {
            height: 58 + bottomInset,
            paddingTop: 7,
            paddingBottom: bottomInset,
            paddingHorizontal: Platform.OS === "ios" ? 6 : 2,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 8,
          },

          tabBarItemStyle: {
            paddingHorizontal: 0,
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
            marginTop: 2,
          },

          tabBarIconStyle: {
            marginTop: 1,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={focused ? 25 : 24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="tasks"
          options={{
            title: t("tabs.tasks"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "create" : "create-outline"}
                size={focused ? 25 : 24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="menu"
          options={{
            title: t("tabs.menu"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={focused ? 25 : 24}
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
              fontSize: 10,
              minWidth: 17,
              height: 17,
              lineHeight: 17,
            },

            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={focused ? 25 : 24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={focused ? 25 : 24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
