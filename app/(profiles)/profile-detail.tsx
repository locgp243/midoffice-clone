import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Divider from "@/components/common/Divider";
import InfoRow from "@/components/common/InfoRow";
import SubPageHeader from "@/components/common/SubHeader";

export default function UserDetailScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const userDetail = useAuthStore((state) => state.userDetail);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* header */}
      <SubPageHeader title="Thông tin tài khoản" />

      {/* content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!userDetail ? (
          // loading
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />

            <Text
              style={[
                styles.loadingText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Đang tải thông tin...
            </Text>
          </View>
        ) : (
          <>
            {/* profile */}
            <View style={styles.profileSection}>
              {userDetail.avatar ? (
                <Image
                  source={{
                    uri: userDetail.avatar,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    {
                      backgroundColor: Colors.primary,
                    },
                  ]}
                >
                  <Ionicons name="person" size={48} color="#FFFFFF" />
                </View>
              )}

              <Text
                style={[
                  styles.name,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {userDetail.name}
              </Text>

              <Text
                style={[
                  styles.username,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                @{userDetail.username}
              </Text>
            </View>

            {/* thông tin cá nhân */}
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
                value={userDetail.name}
              />

              <Divider />

              <InfoRow
                icon="at-outline"
                label="Tên đăng nhập"
                value={userDetail.username}
              />

              <Divider />

              <InfoRow
                icon="mail-outline"
                label="Email"
                value={userDetail.userInfo?.gmail}
              />

              <Divider />

              <InfoRow
                icon="call-outline"
                label="Số điện thoại"
                value={userDetail.userInfo?.phone}
              />
            </View>

            {/* thonog tin công việc */}
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
                value={userDetail.department_name}
              />

              <Divider />

              <InfoRow
                icon="people-outline"
                label="Trưởng phòng"
                value={userDetail.department_head}
              />

              <Divider />

              <InfoRow
                icon="calendar-outline"
                label="Số ngày phép còn lại"
                value={
                  userDetail.remaining_days_off !== undefined
                    ? `${userDetail.remaining_days_off} ngày`
                    : "---"
                }
              />
            </View>

            {/* thông tin hệ thống */}
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              THÔNG TIN HỆ THỐNG
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
                icon="key-outline"
                label="User ID"
                value={String(userDetail.id)}
              />

              <Divider />

              <InfoRow
                icon={
                  userDetail.is_actived === 1
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                label="Trạng thái"
                value={
                  userDetail.is_actived === 1
                    ? "Đang hoạt động"
                    : "Không hoạt động"
                }
                valueColor={
                  userDetail.is_actived === 1 ? Colors.success : Colors.danger
                }
              />

              <Divider />

              <InfoRow
                icon="calendar-outline"
                label="Ngày tạo"
                value={
                  userDetail.created_at
                    ? new Date(userDetail.created_at).toLocaleDateString(
                        "vi-VN",
                      )
                    : "---"
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  //header

  header: {
    width: "100%",
  },

  headerContent: {
    height: 52,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 8,
  },

  backButton: {
    width: 44,

    height: 44,

    alignItems: "center",

    justifyContent: "center",
  },

  headerRight: {
    width: 44,
  },

  headerTitle: {
    fontSize: 17,

    fontWeight: "600",
  },

  // content

  content: {
    padding: 16,

    paddingBottom: 40,
  },

  // loading

  loadingContainer: {
    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 100,
  },

  loadingText: {
    fontSize: 14,

    marginTop: 12,
  },

  // profile

  profileSection: {
    alignItems: "center",

    paddingVertical: 20,

    marginBottom: 8,
  },

  avatar: {
    width: 96,

    height: 96,

    borderRadius: 48,

    borderWidth: 3,

    borderColor: "#FFFFFF",
  },

  avatarPlaceholder: {
    width: 96,

    height: 96,

    borderRadius: 48,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 3,

    borderColor: "#FFFFFF",
  },

  name: {
    fontSize: 20,

    fontWeight: "700",

    marginTop: 12,
  },

  username: {
    fontSize: 14,

    marginTop: 4,
  },

  // secton

  sectionTitle: {
    fontSize: 12,

    fontWeight: "600",

    marginTop: 16,

    marginBottom: 8,

    marginLeft: 4,
  },

  //card

  card: {
    borderRadius: 16,

    paddingHorizontal: 16,

    marginBottom: 8,
  },
});
