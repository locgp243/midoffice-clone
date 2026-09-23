import AppToast from "@/components/common/AppToast";
import Avatar from "@/components/common/Avatar";
import AvatarViewer from "@/components/common/AvatarViewer";
import { Radius, Spacing } from "@/constants/Spacing";
import { FontSize, FontWeight } from "@/constants/Typography";
import { useAppTheme } from "@/hooks/useAppTheme";
import { userServices } from "@/services/userServices";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

interface ProfileRowProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  danger?: boolean;
  showArrow?: boolean;
  onPress?: () => void;
}

function ProfileRow({
  icon,
  title,
  subtitle,
  danger = false,
  showArrow = true,
  onPress,
}: ProfileRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.menuRow,
        {
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: danger
              ? "rgba(244, 67, 54, 0.10)"
              : "rgba(25, 118, 233, 0.10)",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={danger ? "#F44336" : "#1976E9"}
        />
      </View>

      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuTitle,
            {
              color: danger ? "#F44336" : colors.text,
            },
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.menuSubtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {showArrow && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const [showAvatar, setShowAvatar] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const [toast, setToast] = useState({
    visible: false,
    type: "success" as "success" | "error",
    message: "",
  });

  const user = useAuthStore((state) => state.user);
  const userDetail = useAuthStore((state) => state.userDetail);
  const refreshUserDetail = useAuthStore((state) => state.refreshUserDetail);
  const logout = useAuthStore((state) => state.logout);

  const avatar = localAvatar ?? userDetail?.avatar ?? user?.avatar ?? null;

  const userId = user?.userId ?? userDetail?.id;

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({
      visible: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((current) => ({
        ...current,
        visible: false,
      }));
    }, 1000);
  };

  return (
    <>
      <ScrollView
        style={[
          styles.screen,
          {
            backgroundColor: colors.background,
          },
        ]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Pressable
            onPress={() => setShowAvatar(true)}
            style={styles.avatarButton}
          >
            <Avatar source={avatar} size={90} />

            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={styles.userInfo}>
            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                },
              ]}
            >
              {userDetail?.name ?? t("profile.defaultUser")}
            </Text>

            <Text
              style={[
                styles.username,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              @{userDetail?.username ?? "---"}
            </Text>

            <View style={styles.roleContainer}>
              <Ionicons name="briefcase-outline" size={16} color="#1976E9" />

              <Text style={styles.role}>
                {userDetail?.department_name ?? t("profile.defaultEmployee")}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <ProfileRow
            icon="person-outline"
            title={t("profile.title")}
            onPress={() => {
              router.push("/profile-detail");
            }}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <ProfileRow
            icon="lock-closed-outline"
            title={t("profile.changePassword")}
            onPress={() => {
              router.push("/(profiles)/change-password");
            }}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <ProfileRow
            icon="notifications-outline"
            title={t("profile.notifications")}
            subtitle={t("profile.notificationSettings")}
            onPress={() => {
              router.push("/(tabs)/notifications");
            }}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <ProfileRow
            icon="settings-outline"
            title={t("profile.settings")}
            onPress={() => {
              router.push("/(profiles)/multi-languages");
            }}
          />
        </View>

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <ProfileRow
            icon="information-circle-outline"
            title={t("profile.version")}
            subtitle="1.0.0"
            showArrow={false}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <ProfileRow
            icon="refresh-outline"
            title={t("profile.restartApp")}
            onPress={() => {}}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <ProfileRow
            icon="log-out-outline"
            title={t("profile.logout")}
            danger
            showArrow={false}
            onPress={handleLogout}
          />
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

      <AvatarViewer
        visible={showAvatar}
        avatar={userDetail?.avatar ?? user?.avatar ?? null}
        onClose={() => setShowAvatar(false)}
        onConfirmImage={async (uri) => {
          if (!userId) {
            throw new Error(t("profile.userIdNotFound"));
          }

          const response = await userServices.uploadAvatar(userId, uri);

          if (!response.result) {
            throw new Error(t("avatar.updateFailed"));
          }

          await refreshUserDetail();

          showToast("success", t("avatar.updateSuccess"));
        }}
      />

      <View pointerEvents="none" style={styles.toastContainer}>
        <AppToast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: Radius.lg,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarPlaceholder: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 41,
    backgroundColor: "#1976E9",
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  username: {
    marginTop: Spacing.xs,
    fontSize: FontSize.md,
  },
  roleContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.round,
    backgroundColor: "rgba(25,118,233,0.10)",
  },
  role: {
    color: "#1976E9",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  menuCard: {
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  menuSubtitle: {
    marginTop: 3,
    fontSize: FontSize.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 70,
  },
  footer: {
    textAlign: "center",
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
  },
  avatarButton: {
    position: "relative",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#1976E9",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 30,
  },
});
