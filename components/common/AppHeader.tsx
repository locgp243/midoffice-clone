import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/Spacing";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useThemeStore } from "@/store/useThemeStore";

export default function AppHeader() {
  const { colors, isDark } = useAppTheme();

  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.safeContainer,
        {
          paddingTop: insets.top,
          backgroundColor: colors.header,
        },
      ]}
    >
      <View style={styles.header}>
        {/* Logo bên trái */}
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Dark / Light mode bên phải */}
        <Pressable
          onPress={toggleTheme}
          hitSlop={10}
          style={({ pressed }) => [
            styles.themeButton,
            {
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={22}
            color={colors.headerText}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    width: "100%",
  },

  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
  },

  logoImage: {
    width: 100,
    height: 52,
    marginBottom: 8,
  },

  themeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.round,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginRight: 8,
  },
});
