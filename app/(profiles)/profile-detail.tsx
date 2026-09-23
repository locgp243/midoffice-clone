import AppToast from "@/components/common/AppToast";
import Divider from "@/components/common/Divider";
import InfoRow from "@/components/common/InfoRow";
import SubHeader from "@/components/common/SubHeader";

import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";

import { useAuthStore } from "@/store/useAuthStore";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useRef, useState } from "react";

type ToastType = "success" | "error";

export default function ProfileDetailScreen() {
  const { colors } = useAppTheme();

  const user = useAuthStore((state) => state.user);

  const userDetail = useAuthStore((state) => state.userDetail);

  const refreshUserDetail = useAuthStore((state) => state.refreshUserDetail);

  const [showAvatar, setShowAvatar] = useState(false);

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

  const avatar = userDetail?.avatar ?? user?.avatar ?? null;

  const userInfo = userDetail?.userInfo;

  const userId = user?.userId ?? userDetail?.id;

  const createdAt = userDetail?.created_at
    ? new Date(userDetail.created_at).toLocaleDateString("vi-VN")
    : "---";

  const accountStatus =
    userDetail?.is_actived === 1 ? "Đang hoạt động" : "Không hoạt động";

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <SubHeader title="Thông tin tài khoản" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            THÔNG TIN CÁ NHÂN
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <InfoRow
              icon="person-outline"
              label="Họ và tên"
              value={userDetail?.name ?? "---"}
            />

            <Divider />

            <InfoRow
              icon="at-outline"
              label="Tên đăng nhập"
              value={userDetail?.username ?? "---"}
            />

            <Divider />

            <InfoRow
              icon="mail-outline"
              label="Email"
              value={userInfo?.gmail ?? "---"}
            />

            <Divider />

            <InfoRow
              icon="call-outline"
              label="Số điện thoại"
              value={userInfo?.phone ?? "---"}
            />
          </View>
        </View>

        <View>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            THÔNG TIN CÔNG VIỆC
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <InfoRow
              icon="business-outline"
              label="Phòng ban"
              value={userDetail?.department_name ?? "---"}
            />

            <Divider />

            <InfoRow
              icon="person-circle-outline"
              label="Trưởng phòng"
              value={userDetail?.department_head ?? "---"}
            />

            <Divider />

            <InfoRow
              icon="calendar-outline"
              label="Ngày phép còn lại"
              value={
                userDetail?.remaining_days_off !== undefined
                  ? `${userDetail.remaining_days_off} ngày`
                  : "---"
              }
            />
          </View>
        </View>

        <View>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            TÀI KHOẢN
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <InfoRow
              icon="checkmark-circle-outline"
              label="Trạng thái"
              value={accountStatus}
              valueColor={
                userDetail?.is_actived === 1 ? Colors.success : Colors.danger
              }
            />

            <Divider />

            <InfoRow
              icon="calendar-clear-outline"
              label="Ngày tạo"
              value={createdAt}
            />
          </View>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    padding: 16,

    paddingBottom: 40,

    gap: 24,
  },

  profileCard: {
    alignItems: "center",

    padding: 24,

    borderRadius: 16,
  },

  avatarButton: {
    position: "relative",
  },

  cameraBadge: {
    position: "absolute",

    right: 0,

    bottom: 0,

    width: 30,

    height: 30,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: Colors.primary,

    borderWidth: 2,

    borderColor: "#FFFFFF",
  },

  name: {
    marginTop: 14,

    fontSize: 20,

    fontWeight: "700",
  },

  username: {
    marginTop: 4,

    fontSize: 14,
  },

  roleContainer: {
    flexDirection: "row",

    alignItems: "center",

    gap: 6,

    marginTop: 10,

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: "rgba(25, 118, 233, 0.10)",
  },

  roleText: {
    color: Colors.primary,

    fontSize: 13,

    fontWeight: "600",
  },

  avatarHint: {
    marginTop: 12,

    fontSize: 12,
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
