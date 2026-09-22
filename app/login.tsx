import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Radius, Spacing } from "@/constants/Spacing";
import { FontSize, FontWeight } from "@/constants/Typography";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên đăng nhập và mật khẩu.");

      return;
    }

    try {
      await login(username.trim(), password);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);

      Alert.alert(
        "Đăng nhập thất bại",
        error?.response?.data?.message ??
          error?.message ??
          "Không thể đăng nhập. Vui lòng thử lại.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xxl,
            paddingBottom: insets.bottom + Spacing.xxl,
          },
        ]}
      >
        {/* Logo */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <View style={styles.heading}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Đăng nhập
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Chào mừng bạn quay trở lại MID Office
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Tên đăng nhập
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={21}
                color={colors.textSecondary}
              />

              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
              />
            </View>
          </View>

          <View>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Mật khẩu
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color={colors.textSecondary}
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
              />

              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.loginButton,
              {
                opacity: pressed || isLoading ? 0.7 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Đăng nhập</Text>

                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>

        <Text
          style={[
            styles.footer,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          MID Office
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",

    paddingHorizontal: Spacing.xxl,
  },

  logo: {
    width: 170,
    height: 65,

    alignSelf: "center",

    marginBottom: Spacing.xxxl,
  },

  heading: {
    marginBottom: Spacing.xxl,
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  subtitle: {
    marginTop: Spacing.sm,

    fontSize: FontSize.base,
    lineHeight: 23,
  },

  form: {
    gap: Spacing.xl,
  },

  label: {
    marginBottom: Spacing.sm,

    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
  },

  inputContainer: {
    height: 54,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: Spacing.lg,

    borderWidth: 1,
    borderRadius: Radius.md,

    gap: Spacing.md,
  },

  input: {
    flex: 1,

    height: "100%",

    fontSize: FontSize.base,
  },

  loginButton: {
    height: 54,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: Spacing.sm,

    marginTop: Spacing.sm,

    borderRadius: Radius.md,

    backgroundColor: "#1976E9",
  },

  loginButtonText: {
    color: "#FFFFFF",

    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },

  footer: {
    marginTop: Spacing.xxxl,

    textAlign: "center",

    fontSize: FontSize.sm,
  },
});
