import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";

export default function RootLayout() {
  const { colors } = useAppTheme();

  const isInitialized = useAuthStore((state) => state.isInitialized);

  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  /**
   * Chạy 1 lần khi app khởi động.
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Trong lúc đang đọc token từ SecureStore
   * thì chưa render Login hoặc Tabs.
   */
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View
          style={[
            styles.loading,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <ActivityIndicator size="large" color="#1976E9" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(profiles)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },
});
