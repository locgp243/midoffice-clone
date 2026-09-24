import AnimatedBell from "@/components/common/AnimatedBell";
import AnimatedUnreadDot from "@/components/common/AnimatedUnreadDot";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationData, NotificationLink } from "@/types/Notifications";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface NotificationGroup {
  date: string;
  notifications: NotificationData[];
}

export default function NotificationsScreen() {
  const { colors, isDark } = useAppTheme();

  const notifications = useNotificationStore((state) => state.notifications);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const seenNotification = useNotificationStore(
    (state) => state.seenNotification,
  );

  const handleNotificationPress = async (notification: NotificationData) => {
    try {
      if (notification.is_seen === 0) {
        await seenNotification(notification.id);
      }

      if (!notification.link) return;

      const linkData: NotificationLink = JSON.parse(notification.link);

      switch (linkData.type) {
        case "task":
          if (!linkData.task_id) return;

          router.push({
            pathname: "/(tasks)/[id]",
            params: {
              id: linkData.task_id.toString(),
            },
          });
          break;

        default:
          break;
      }
    } catch (error: any) {
      console.log(error?.response?.data ?? error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("vi-VN");
  };

  const groupNotifications = (
    data: NotificationData[],
  ): NotificationGroup[] => {
    const groups: Record<string, NotificationData[]> = {};

    data.forEach((notification) => {
      const date = formatDate(notification.created_at);

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(notification);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      notifications: items,
    }));
  };

  const notificationGroups = groupNotifications(notifications);

  if (isLoading && notifications.length === 0) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {notificationGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Không có thông báo.
            </Text>
          </View>
        ) : (
          notificationGroups.map((group) => (
            <View key={group.date} style={styles.group}>
              <Text
                style={[
                  styles.date,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Ngày {group.date}
              </Text>

              <View style={styles.notificationList}>
                {group.notifications.map((notification) => {
                  const unread = notification.is_seen === 0;

                  return (
                    <Pressable
                      key={notification.id}
                      onPress={() => handleNotificationPress(notification)}
                      style={({ pressed }) => [
                        styles.notificationCard,
                        {
                          backgroundColor: unread
                            ? isDark
                              ? "rgba(25, 118, 233, 0.15)"
                              : "#E9F6FD"
                            : colors.surface,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <AnimatedBell unread={unread} />
                      </View>

                      <View style={styles.content}>
                        <Text
                          style={[
                            styles.title,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {notification.title}
                        </Text>

                        <Text
                          style={[
                            styles.description,
                            {
                              color: colors.text,
                            },
                          ]}
                        >
                          {notification.description}
                        </Text>

                        <Text
                          style={[
                            styles.time,
                            {
                              color: colors.textSecondary,
                            },
                          ]}
                        >
                          {formatTime(notification.created_at)}
                        </Text>
                      </View>

                      {unread && <AnimatedUnreadDot />}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
  },
  group: {
    marginBottom: 28,
  },
  date: {
    marginLeft: 4,
    marginBottom: 14,
    fontSize: 14,
    fontWeight: "700",
  },
  notificationList: {
    gap: 12,
  },
  notificationCard: {
    minHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  title: {
    paddingRight: 16,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 22,
  },
  description: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 18,
  },
  time: {
    marginTop: 6,
    fontSize: 9,
    lineHeight: 17,
  },
});
