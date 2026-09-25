import AppToast from "@/components/common/AppToast";
import Divider from "@/components/common/Divider";
import InfoRow from "@/components/common/InfoRow";
import SubHeader from "@/components/common/SubHeader";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { userServices } from "@/services/userServices";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ToastType = "success" | "error";

interface EditFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  colors: {
    text: string;
    textSecondary: string;
    border: string;
    surface: string;
  };
}

export default function ProfileDetailScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const language = useLanguageStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const userDetail = useAuthStore((state) => state.userDetail);
  const refreshUserDetail = useAuthStore((state) => state.refreshUserDetail);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (type: ToastType, message: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({
      visible: true,
      type,
      message,
    });

    toastTimer.current = setTimeout(() => {
      setToast((current) => ({
        ...current,
        visible: false,
      }));
    }, 2500);
  };

  const userInfo = userDetail?.userInfo;
  const userId = user?.userId ?? userDetail?.id;

  useEffect(() => {
    if (!userDetail) return;

    setName(userDetail.name ?? "");
    setUsername(userDetail.username ?? "");
    setEmail(userDetail.userInfo?.gmail ?? "");
    setPhone(userDetail.userInfo?.phone ?? "");
  }, [userDetail]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const createdAt = userDetail?.created_at
    ? new Date(userDetail.created_at).toLocaleDateString(
        language === "vi" ? "vi-VN" : "en-US",
      )
    : "---";

  const accountStatus =
    userDetail?.is_actived === 1 ? t("profile.active") : t("profile.inactive");

  const resetForm = () => {
    setName(userDetail?.name ?? "");
    setUsername(userDetail?.username ?? "");
    setEmail(userInfo?.gmail ?? "");
    setPhone(userInfo?.phone ?? "");
  };

  const handleStartEdit = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      showToast("error", t("profile.fullNameRequired"));
      return false;
    }

    if (!username.trim()) {
      showToast("error", t("profile.usernameRequired"));
      return false;
    }

    if (!email.trim()) {
      showToast("error", t("profile.emailRequired"));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      showToast("error", t("profile.invalidEmail"));
      return false;
    }

    if (!phone.trim()) {
      showToast("error", t("profile.phoneRequired"));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (isSaving || !validateForm()) return;

    if (!userId) {
      showToast("error", t("profile.userIdNotFound"));
      return;
    }

    if (!userDetail) {
      showToast("error", t("profile.userNotLoaded"));
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        department_id: userDetail.department_id,
        info: JSON.stringify({
          gmail: email.trim(),
          phone: phone.trim(),
        }),
        name: name.trim(),
        parent_id: userDetail.parent_id,
        username: username.trim(),
      };

      const response = await userServices.updateUser(userId, payload);

      if (!response.result) {
        throw new Error(t("profile.updateFailed"));
      }

      await refreshUserDetail();
      setIsEditing(false);
      showToast("success", t("profile.updateSuccess"));
    } catch (error: any) {
      showToast(
        "error",
        error?.response?.data?.message ??
          error?.message ??
          t("profile.updateFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SubHeader title={t("profile.title")} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <View>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("profile.personalInformation")}
            </Text>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              {isEditing ? (
                <>
                  <EditField
                    icon="person-outline"
                    label={t("profile.fullName")}
                    value={name}
                    onChangeText={setName}
                    placeholder={t("profile.fullNamePlaceholder")}
                    colors={colors}
                  />

                  <Divider />

                  <EditField
                    icon="at-outline"
                    label={t("profile.username")}
                    value={username}
                    onChangeText={setUsername}
                    placeholder={t("profile.usernamePlaceholder")}
                    autoCapitalize="none"
                    colors={colors}
                  />

                  <Divider />

                  <EditField
                    icon="mail-outline"
                    label={t("profile.email")}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t("profile.emailPlaceholder")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    colors={colors}
                  />

                  <Divider />

                  <EditField
                    icon="call-outline"
                    label={t("profile.phone")}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={t("profile.phonePlaceholder")}
                    keyboardType="phone-pad"
                    colors={colors}
                  />
                </>
              ) : (
                <>
                  <InfoRow
                    icon="person-outline"
                    label={t("profile.fullName")}
                    value={userDetail?.name ?? "---"}
                  />

                  <Divider />

                  <InfoRow
                    icon="at-outline"
                    label={t("profile.username")}
                    value={userDetail?.username ?? "---"}
                  />

                  <Divider />

                  <InfoRow
                    icon="mail-outline"
                    label={t("profile.email")}
                    value={userInfo?.gmail ?? "---"}
                  />

                  <Divider />

                  <InfoRow
                    icon="call-outline"
                    label={t("profile.phone")}
                    value={userInfo?.phone ?? "---"}
                  />
                </>
              )}
            </View>
          </View>

          <View>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("profile.workInformation")}
            </Text>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <InfoRow
                icon="business-outline"
                label={t("profile.department")}
                value={userDetail?.department_name ?? "---"}
              />

              <Divider />

              <InfoRow
                icon="person-circle-outline"
                label={t("profile.departmentHead")}
                value={userDetail?.department_head ?? "---"}
              />

              <Divider />

              <InfoRow
                icon="calendar-outline"
                label={t("profile.remainingDaysOff")}
                value={
                  userDetail?.remaining_days_off !== undefined
                    ? `${userDetail.remaining_days_off} ${t("common.day")}`
                    : "---"
                }
              />
            </View>
          </View>

          <View>
            <Text
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              {t("profile.accountInformation")}
            </Text>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <InfoRow
                icon="checkmark-circle-outline"
                label={t("profile.status")}
                value={accountStatus}
                valueColor={
                  userDetail?.is_actived === 1 ? Colors.success : Colors.danger
                }
              />

              <Divider />

              <InfoRow
                icon="calendar-clear-outline"
                label={t("profile.createdAt")}
                value={createdAt}
              />
            </View>
          </View>

          {!isEditing ? (
            <Pressable
              onPress={handleStartEdit}
              style={({ pressed }) => [
                styles.editButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />

              <Text style={styles.editButtonText}>
                {t("profile.editInformation")}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.actionRow}>
              <Pressable
                disabled={isSaving}
                onPress={handleCancelEdit}
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    opacity: isSaving ? 0.5 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  {t("common.cancel")}
                </Text>
              </Pressable>

              <Pressable
                disabled={isSaving}
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    opacity: isSaving ? 0.6 : pressed ? 0.8 : 1,
                  },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="checkmark-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                )}

                <Text style={styles.saveButtonText}>
                  {isSaving ? t("profile.saving") : t("profile.saveChanges")}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View pointerEvents="none" style={styles.toastContainer}>
        <AppToast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
        />
      </View>
    </View>
  );
}

function EditField({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  colors,
}: EditFieldProps) {
  return (
    <View style={styles.editField}>
      <View style={styles.editFieldHeader}>
        <Ionicons name={icon} size={20} color={Colors.primary} />

        <Text style={[styles.editFieldLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  card: {
    paddingHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.08)",
  },
  editField: {
    paddingVertical: 14,
  },
  editFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  editFieldLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
  },
  editButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  toastContainer: {
    position: "absolute",
    top: 30,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 30,
  },
});
