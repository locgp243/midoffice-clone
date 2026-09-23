import PasswordInput from "@/components/common/PasswordInput";
import SubPageHeader from "@/components/common/SubHeader";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { userServices } from "@/services/userServices";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChangePasswordScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      Alert.alert(
        t("password.notificationTitle"),
        t("password.oldPasswordRequired"),
      );
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert(
        t("password.notificationTitle"),
        t("password.newPasswordRequired"),
      );
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert(
        t("password.notificationTitle"),
        t("password.confirmPasswordRequired"),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t("password.notificationTitle"),
        t("password.passwordNotMatch"),
      );
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert(
        t("password.notificationTitle"),
        t("password.passwordMustBeDifferent"),
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await userServices.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      if (!response.result) {
        Alert.alert(t("password.failedTitle"), t("password.failed"));
        return;
      }

      Alert.alert(t("password.successTitle"), t("password.success"));

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log("CHANGE PASSWORD ERROR:", error);

      Alert.alert(t("password.errorTitle"), t("password.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <SubPageHeader title={t("password.title")} />

      <View style={styles.content}>
        <View
          style={[
            styles.securityCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={26}
              color={Colors.primary}
            />
          </View>

          <View style={styles.securityContent}>
            <Text
              style={[
                styles.securityTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {t("password.changePassword")}
            </Text>

            <Text
              style={[
                styles.securityDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {t("password.description")}
            </Text>
          </View>
        </View>

        <PasswordInput
          label={t("password.oldPassword")}
          placeholder={t("password.oldPasswordPlaceholder")}
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <PasswordInput
          label={t("password.newPassword")}
          placeholder={t("password.newPasswordPlaceholder")}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <PasswordInput
          label={t("password.confirmPassword")}
          placeholder={t("password.confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={handleChangePassword}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {t("password.updating")}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="key-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {t("password.update")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  securityCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  securityIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 118, 233, 0.1)",
  },
  securityContent: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
