import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Radius, Spacing } from "@/constants/Spacing";
import { FontSize, FontWeight } from "@/constants/Typography";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";

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

  const user = useAuthStore((state) => state.user);

  const userDetail = useAuthStore((state) => state.userDetail);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",

        onPress: async () => {
          await logout();

          router.replace("/login");
        },
      },
    ]);
  };

  return (
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
      {/* User information */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.surface,
          },
        ]}
      >
        {user?.avatar ? (
          <Image
            source={{
              uri: user.avatar,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
        )}

        <View style={styles.userInfo}>
          <Text
            style={[
              styles.name,
              {
                color: colors.text,
              },
            ]}
          >
            {userDetail?.name ?? "Người dùng"}
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

            <Text style={styles.role}>{user?.roleName ?? "Nhân viên"}</Text>
          </View>
        </View>
      </View>

      {/* Account */}
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
          title="Thông tin tài khoản"
          onPress={() => {
            // TODO: Account detail
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
          title="Bảo mật & Mật khẩu"
          onPress={() => {
            // TODO: Security
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
          title="Thông báo"
          subtitle="Quản lý cài đặt thông báo"
          onPress={() => {
            // TODO: Notification settings
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
          title="Cài đặt"
          onPress={() => {
            // TODO: Settings
          }}
        />
      </View>

      {/* System */}
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
          title="Phiên bản"
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
          title="Khởi động lại ứng dụng"
          onPress={() => {
            // TODO
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
          icon="log-out-outline"
          title="Đăng xuất"
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
});
