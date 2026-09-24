import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";

type TaskDetail = {
  id: string;
  title: string;
  priority: number;
  creator: string;
  createdAt: string;
  status: "pending" | "processing" | "completed";
  statusLabel: string;
  actionStatus: string;
  content: string;
  expectedStart: string;
  note: string;
  progress: number;
  expense: number;
  member: {
    name: string;
    isMe: boolean;
    remaining: string;
    status: string;
    deadline: string;
  };
};

const PRIMARY = "#1976E9";
const STAR = "#FFC928";
const WARNING = "#F4A62A";
const WARNING_BACKGROUND = "#FFF6E8";

const mockTasks: TaskDetail[] = [
  {
    id: "1",
    title: "180 ngày tập trung",
    priority: 3,
    creator: "Phan Công Hậu",
    createdAt: "23:19:06 09/09/2026",
    status: "pending",
    statusLabel: "waitingConfirmation",
    actionStatus: "waitingAcceptance",
    content: "180 ngày tập trung",
    expectedStart: "23:19:06 09/09/2026",
    note: "",
    progress: 100,
    expense: 0,
    member: {
      name: "Phan Công Hậu",
      isMe: true,
      remaining: "166d 03:23:32",
      status: "pending",
      deadline: "17:00:00 09/03/2027",
    },
  },
  {
    id: "2",
    title: "Hoàn thành Ứng dụng MID Office",
    priority: 3,
    creator: "Sàn Ứng Mọi",
    createdAt: "11:10:07 14/04/2026",
    status: "processing",
    statusLabel: "processing",
    actionStatus: "processing",
    content: "Hoàn thành các chức năng của ứng dụng MID Office.",
    expectedStart: "11:10:07 14/04/2026",
    note: "",
    progress: 70,
    expense: 0,
    member: {
      name: "Phan Công Hậu",
      isMe: true,
      remaining: "20d 10:30:00",
      status: "processing",
      deadline: "23:00:00 18/06/2026",
    },
  },
];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comment, setComment] = useState("");

  const task = useMemo(() => {
    return mockTasks.find((item) => item.id === id) ?? mockTasks[0];
  }, [id]);

  const closeCommentModal = () => {
    setCommentModalVisible(false);
  };

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

          <TouchableOpacity activeOpacity={0.8} style={styles.headerButton}>
            <Ionicons name="refresh" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleContainer}>
              <Text style={[styles.taskTitle, { color: colors.text }]}>
                {task.title}
              </Text>

              <View style={styles.stars}>
                {Array.from({ length: task.priority }).map((_, index) => (
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

            <Text style={[styles.creatorText, { color: colors.textSecondary }]}>
              {task.creator}
            </Text>
          </View>

          <Text style={[styles.createdText, { color: colors.textSecondary }]}>
            {t("taskDetail.createdAt")} {task.createdAt}
          </Text>

          <View style={styles.badges}>
            <View style={styles.warningBadge}>
              <Text style={styles.warningBadgeText}>
                {t(`taskDetail.${task.statusLabel}`)}
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
                {t(`taskDetail.${task.actionStatus}`)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <DetailField
            label={t("taskDetail.content")}
            value={task.content}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <DetailField
            label={t("taskDetail.expectedStart")}
            value={task.expectedStart}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <DetailField
            label={t("taskDetail.note")}
            value={task.note || t("taskDetail.noNote")}
            textColor={colors.text}
            secondaryColor={colors.textSecondary}
          />

          <View style={styles.imageSection}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
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

        <SectionCard
          title={`${t("taskDetail.progress")} (${task.progress}%)`}
          colors={colors}
        >
          <EmptySection
            icon="git-branch-outline"
            text={t("taskDetail.noTimeline")}
            color={colors.textSecondary}
          />
        </SectionCard>

        <SectionCard
          title={`${t("taskDetail.expense")} (${task.expense.toLocaleString()}đ)`}
          colors={colors}
        >
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
                <Ionicons name="person" size={23} color={PRIMARY} />
              </View>

              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.text }]}>
                  {task.member.name}
                  {task.member.isMe ? ` (${t("taskDetail.you")})` : ""}
                </Text>

                <Text style={styles.remainingText}>
                  {task.member.remaining}
                </Text>
              </View>

              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>
                  {t(`tasks.${task.member.status}`)}
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
                style={[styles.deadlineText, { color: colors.textSecondary }]}
              >
                {t("taskDetail.deadline")}: {task.member.deadline}
              </Text>
            </View>
          </View>
        </SectionCard>
      </ScrollView>

      <View
        style={[
          styles.bottomActions,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.rejectButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.rejectText, { color: colors.text }]}>
            {t("taskDetail.reject")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.confirmButton}>
          <Text style={styles.confirmText}>
            {t("taskDetail.confirmProcessing")}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={commentModalVisible}
        transparent
        animationType="fade"
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>
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
              style={[styles.modalDivider, { backgroundColor: colors.border }]}
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
                <Ionicons name="person" size={22} color={PRIMARY} />
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
                  { borderColor: colors.border },
                ]}
                onPress={closeCommentModal}
              >
                <Text
                  style={[styles.cancelCommentText, { color: colors.text }]}
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
        style={[styles.sectionDivider, { backgroundColor: colors.border }]}
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
    paddingBottom: 110,
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
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 27,
  },
  moreButton: {
    width: 36,
    height: 36,
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
    fontSize: 15,
  },
  createdText: {
    fontSize: 14,
    marginTop: 6,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },
  warningBadge: {
    backgroundColor: WARNING_BACKGROUND,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 4,
  },
  warningBadgeText: {
    color: WARNING,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: PRIMARY,
    fontSize: 13,
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
    fontSize: 14,
    fontWeight: "600",
  },
  fieldValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  imageSection: {
    marginTop: 18,
    gap: 10,
  },
  emptyImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  addButton: {
    width: 34,
    height: 34,
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
    fontSize: 14,
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
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
  },
  remainingText: {
    color: PRIMARY,
    fontSize: 13,
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
    fontSize: 13,
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  rejectButton: {
    height: 50,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 15,
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
    boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 16px",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
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
    alignItems: "flex-start",
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
    minHeight: 85,
    maxHeight: 130,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: "600",
  },
});
