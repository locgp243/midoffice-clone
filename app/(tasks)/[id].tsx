import { useAppTheme } from "@/hooks/useAppTheme";
import { taskServices } from "@/services/taskServices";
import { TaskApiItem } from "@/types/Task";
import { formatDateTime } from "@/utils/formatDateTime";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
const PRIMARY = "#1976E9";
const STAR = "#FFC928";
const SUCCESS = "#28A745";
const SUCCESS_BACKGROUND = "#EAF7ED";
const WARNING = "#F4A62A";
const WARNING_BACKGROUND = "#FFF6E8";

const getStatusText = (status: number) => {
  if (status === 3) return "Hoàn thành";
  if (status === 2) return "Đang chờ";
  return `Status ${status}`;
};

import { useAuthStore } from "@/store/useAuthStore";
import { getImageUrl } from "@/utils/imageUrl";
export default function TaskDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    creator: string;
  }>();

  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [task, setTask] = useState<TaskApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comment, setComment] = useState("");

  const userId = useAuthStore((state) => state.userId);
  const userDetail = useAuthStore((status) => status.userDetail);
  const userDetailAvatar = userDetail?.avatar;
  console.log("check avatar: ", userDetailAvatar);
  console.log("check avatar 2: ", getImageUrl(userDetailAvatar));

  const avatarUrl = userDetailAvatar ? getImageUrl(userDetailAvatar) : null;

  const taskId = Number(params.id);
  const creator = Number(params.creator);

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId || Number.isNaN(taskId) || !userId) {
      setLoading(false);
      setTask(null);
      return;
    }

    try {
      setLoading(true);

      console.log("TASK DETAIL PARAMS:", {
        taskId,
        userId,
      });

      const data = await taskServices.getDetail(taskId, creator);

      console.log("TASK DETAIL DATA:", data);

      setTask(data);
    } catch (error) {
      console.log("GET TASK DETAIL ERROR:", error);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId, userId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const handleRefresh = useCallback(async () => {
    if (!taskId || Number.isNaN(taskId) || !userId) return;

    try {
      setRefreshing(true);

      const data = await taskServices.getDetail(taskId, creator);

      setTask(data);
    } catch (error) {
      console.log("REFRESH TASK DETAIL ERROR:", error);
    } finally {
      setRefreshing(false);
    }
  }, [taskId, userId]);
  const closeCommentModal = () => {
    setCommentModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {t("taskDetail.title")}
            </Text>

            <View style={styles.headerButton} />
          </View>
        </SafeAreaView>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {t("taskDetail.title")}
            </Text>

            <View style={styles.headerButton} />
          </View>
        </SafeAreaView>

        <View style={styles.notFoundContainer}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={colors.textSecondary}
          />

          <Text
            style={[
              styles.notFoundText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Không tìm thấy công việc
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.retryButton}
            onPress={fetchTaskDetail}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isCompleted = task.status === 3;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {t("taskDetail.title")}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="refresh" size={25} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: isCompleted
              ? 24 + insets.bottom
              : 100 + insets.bottom,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleContainer}>
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                {task.name}
              </Text>

              <View style={styles.stars}>
                {Array.from({
                  length: Math.max(0, task.priority || 0),
                }).map((_, index) => (
                  <Ionicons
                    key={index}
                    name="star-outline"
                    size={22}
                    color={STAR}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.7} style={styles.moreButton}>
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.creatorRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.creatorText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {task.creator_name || "--"}
            </Text>
          </View>

          <Text
            style={[
              styles.createdText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {t("taskDetail.createdAt")} {formatDateTime(task.created_at)}
          </Text>

          <View style={styles.badges}>
            <View
              style={[
                styles.statusBadge,
                isCompleted
                  ? {
                      backgroundColor: isDark
                        ? "rgba(40,167,69,0.18)"
                        : SUCCESS_BACKGROUND,
                    }
                  : {
                      backgroundColor: isDark
                        ? "rgba(244,166,42,0.18)"
                        : WARNING_BACKGROUND,
                    },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: isCompleted ? SUCCESS : WARNING,
                  },
                ]}
              >
                {getStatusText(task.status)}
              </Text>
            </View>

            <View
              style={[
                styles.primaryBadge,
                {
                  backgroundColor: isDark ? "rgba(25,118,233,0.18)" : "#E8F2FF",
                },
              ]}
            >
              <Text style={styles.primaryBadgeText}>
                {task.type_task_name || "--"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <DetailField
            label={t("taskDetail.content")}
            value={task.name || "--"}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <DetailField
            label={t("taskDetail.expectedStart")}
            value={formatDateTime(task.start_time_location)}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <DetailField
            label={t("taskDetail.deadline")}
            value={formatDateTime(task.expired_on)}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.border,
              },
            ]}
          />

          <DetailField
            label={t("taskDetail.note")}
            value={task.note || t("taskDetail.noNote")}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View style={styles.imageSection}>
            <Text
              style={[
                styles.fieldLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {t("taskDetail.images")}
            </Text>

            <View
              style={[
                styles.emptyImage,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={28}
                color={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <SectionCard title={`${t("taskDetail.progress")} (0%)`} colors={colors}>
          <EmptySection
            icon="git-branch-outline"
            text={t("taskDetail.noTimeline")}
            color={colors.textSecondary}
          />
        </SectionCard>

        <SectionCard title={`${t("taskDetail.expense")} (0đ)`} colors={colors}>
          <EmptySection
            icon="wallet-outline"
            text={t("taskDetail.noExpense")}
            color={colors.textSecondary}
          />
        </SectionCard>

        <SectionCard
          title={t("taskDetail.comments")}
          colors={colors}
          onAddPress={() => setCommentModalVisible(true)}
        >
          <EmptySection
            icon="chatbubble-outline"
            text={t("taskDetail.noComments")}
            color={colors.textSecondary}
          />
        </SectionCard>

        <SectionCard title={`${t("taskDetail.members")} (1)`} colors={colors}>
          <View style={styles.member}>
            <View style={styles.memberTop}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark
                      ? "rgba(25,118,233,0.18)"
                      : "#E8F2FF",
                  },
                ]}
              >
                {userDetailAvatar ? (
                  <Image
                    source={{ uri: avatarUrl as string }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={23} color={PRIMARY} />
                )}
              </View>

              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.text }]}>
                  {task.username || "--"}
                </Text>

                <Text
                  style={[
                    styles.remainingText,
                    {
                      color: isCompleted ? SUCCESS : PRIMARY,
                    },
                  ]}
                >
                  {getStatusText(task.status)}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isCompleted
                    ? {
                        backgroundColor: isDark
                          ? "rgba(40,167,69,0.18)"
                          : SUCCESS_BACKGROUND,
                      }
                    : {
                        backgroundColor: isDark
                          ? "rgba(244,166,42,0.18)"
                          : WARNING_BACKGROUND,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: isCompleted ? SUCCESS : WARNING,
                    },
                  ]}
                >
                  {getStatusText(task.status)}
                </Text>
              </View>
            </View>

            <View style={styles.deadlineRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.textSecondary}
              />

              <Text
                style={[
                  styles.deadlineText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {t("taskDetail.deadline")}: {formatDateTime(task.expired_on)}
              </Text>
            </View>
          </View>
        </SectionCard>
      </ScrollView>

      {!isCompleted && (
        <View
          style={[
            styles.bottomActions,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.rejectButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={colors.text}
            />

            <Text
              style={[
                styles.rejectText,
                {
                  color: colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {t("taskDetail.reject")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.confirmButton}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={styles.confirmText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {t("taskDetail.confirmProcessing")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeCommentModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackdrop}
            onPress={closeCommentModal}
          />

          <View
            style={[
              styles.commentModal,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t("taskDetail.addComment")}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalCloseButton}
                onPress={closeCommentModal}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.modalDivider,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <View style={styles.commentInputRow}>
              <View
                style={[
                  styles.commentAvatar,
                  {
                    backgroundColor: isDark
                      ? "rgba(25,118,233,0.18)"
                      : "#E8F2FF",
                  },
                ]}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl as string }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={22} color={PRIMARY} />
                )}
              </View>

              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t("taskDetail.commentPlaceholder")}
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
                style={[
                  styles.commentInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            <View style={styles.commentActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.cancelCommentButton,
                  {
                    borderColor: colors.border,
                  },
                ]}
                onPress={closeCommentModal}
              >
                <Text
                  style={[
                    styles.cancelCommentText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!comment.trim()}
                style={[
                  styles.sendCommentButton,
                  !comment.trim() && styles.sendCommentButtonDisabled,
                ]}
              >
                <Ionicons name="send" size={17} color="#FFFFFF" />

                <Text style={styles.sendCommentText}>
                  {t("taskDetail.send")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
  textColor: string;
  secondaryColor: string;
};

function DetailField({
  label,
  value,
  textColor,
  secondaryColor,
}: DetailFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: secondaryColor }]}>
        {label}
      </Text>

      <Text style={[styles.fieldValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  colors: {
    surface: string;
    text: string;
    border: string;
  };
  onAddPress?: () => void;
};

function SectionCard({
  title,
  children,
  colors,
  onAddPress,
}: SectionCardProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.addButton, { borderColor: colors.border }]}
          onPress={onAddPress}
        >
          <Ionicons name="add" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.sectionDivider,
          {
            backgroundColor: colors.border,
          },
        ]}
      />

      {children}
    </View>
  );
}

type EmptySectionProps = {
  icon: "git-branch-outline" | "wallet-outline" | "chatbubble-outline";
  text: string;
  color: string;
};

function EmptySection({ icon, text, color }: EmptySectionProps) {
  return (
    <View style={styles.emptySection}>
      <Ionicons name={icon} size={25} color={color} />

      <Text style={[styles.emptySectionText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 12,
  },
  retryButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  headerSafeArea: {
    backgroundColor: PRIMARY,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 27,
  },
  moreButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stars: {
    flexDirection: "row",
    marginTop: 5,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 13,
  },
  creatorText: {
    fontSize: 12,
  },
  createdText: {
    fontSize: 12,
    marginTop: 6,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },
  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  primaryBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  fieldValue: {
    fontSize: 12,
    lineHeight: 22,
  },
  imageSection: {
    marginTop: 18,
    gap: 10,
  },
  emptyImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.08)",
  },
  sectionHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
  emptySection: {
    minHeight: 95,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptySectionText: {
    fontSize: 12,
  },
  member: {
    paddingTop: 14,
  },
  memberTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "600",
  },
  remainingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    marginLeft: 54,
  },
  deadlineText: {
    fontSize: 12,
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  rejectButton: {
    flex: 0.8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  rejectText: {
    fontSize: 13,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 12,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  commentModal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.16)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  commentInput: {
    flex: 1,
    minHeight: 55,
    maxHeight: 130,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  cancelCommentButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelCommentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sendCommentButton: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY,
  },
  sendCommentButtonDisabled: {
    opacity: 0.45,
  },
  sendCommentText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
