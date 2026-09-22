import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

/**
 * Layout quản lý Bottom Tab Navigation.
 *
 * App hiện tại có 5 tab:
 *
 * 1. Tổng quan
 * 2. Nhiệm vụ
 * 3. Danh sách
 * 4. Thông báo
 * 5. Tôi
 *
 * Sau này:
 * - Badge notification sẽ lấy từ API/store.
 * - Label sẽ lấy từ i18n.
 * - Màu sắc sẽ lấy từ Theme.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Màu tab đang được chọn
        tabBarActiveTintColor: "#1976E9",

        // Màu tab chưa được chọn
        tabBarInactiveTintColor: "#777777",

        tabBarStyle: {
          height: 70,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#EEEEEE",
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      {/* Tổng quan */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng quan",

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Nhiệm vụ */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Nhiệm vụ",

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "create" : "create-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Danh sách */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Danh sách",

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Thông báo */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",

          // Tạm thời hard-code 3 giống ảnh mẫu.
          // Sau này lấy unread count từ API/store.
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

      {/* Tôi */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tôi",

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
  );
}
