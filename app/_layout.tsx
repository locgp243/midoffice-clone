import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";

import { pushNotificationServices } from "@/services/pushNotificationServices";
export default function RootLayout() {
  const { colors } = useAppTheme();

  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializeLanguages = useLanguageStore(
    (state) => state.initializeLanguage,
  );

  const isLanguagesInitialized = useLanguageStore(
    (state) => state.isInitialized,
  );

  useEffect(() => {
    const initializePushNotification = async () => {
      try {
        const token = await pushNotificationServices.initialize();
        console.log("check token: ", token);
      } catch (e) {
        console.log("useEffect layout(app), check bug push notifications: ", e);
      }
    };

    initializePushNotification();
  }, []);

  useEffect(() => {
    initializeAuth();
    initializeLanguages();
  }, [initializeAuth, initializeLanguages]);

  if (!isInitialized || !isLanguagesInitialized) {
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
        <Stack.Screen
          name="(tasks)"
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
