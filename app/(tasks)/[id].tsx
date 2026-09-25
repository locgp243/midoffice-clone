import { useAppTheme } from "@/hooks/useAppTheme";
import { taskServices } from "@/services/taskServices";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskApiItem, TaskComment } from "@/types/Task";
import { formatDateTime } from "@/utils/formatDateTime";
import { getImageUrl } from "@/utils/imageUrl";
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
  Pressable,
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

import * as ImagePicker from "expo-image-picker";

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

export default function TaskDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    creator?: string;
  }>();

  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [task, setTask] = useState<TaskApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [commentImages, setCommentImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openImagePreview = (images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setImagePreviewVisible(true);
  };

  const closeImagePreview = () => {
    setImagePreviewVisible(false);
    setPreviewImages([]);
    setPreviewIndex(0);
  };

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const userId = useAuthStore((state) => state.userId);
  const userDetail = useAuthStore((state) => state.userDetail);

  const userDetailAvatar = userDetail?.avatar;

  const avatarUrl = userDetailAvatar
    ? (getImageUrl(userDetailAvatar) ?? undefined)
    : undefined;

  const taskId = Number(params.id);

  const creator = params.creator ? Number(params.creator) : undefined;

  const fetchTaskDetail = useCallback(async () => {
    if (!taskId || Number.isNaN(taskId) || !userId) {
      setLoading(false);
      setTask(null);
      return;
    }

    try {
      setLoading(true);

      const data = await taskServices.getDetail(taskId, creator);

      console.log("check task:", data);

      setTask(data);
    } catch (error: any) {
      console.log("lõi:", error?.response?.data ?? error);

      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [taskId, creator, userId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const fetchComments = useCallback(async () => {
    if (!taskId || Number.isNaN(taskId)) {
      setComments([]);
      return;
    }

    try {
      setLoadingComments(true);

      const data = await taskServices.getTaskComments(taskId);

      setComments(data);
    } catch (error: any) {
      console.log("log lỗi comment:", error?.response?.data ?? error);

      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleRefresh = useCallback(async () => {
    if (!taskId || Number.isNaN(taskId) || !userId) {
      return;
    }

    try {
      setRefreshing(true);

      const data = await taskServices.getDetail(taskId, creator);

      setTask(data);
    } catch (error: any) {
      console.log("lỗi khi reshet:", error?.response?.data ?? error);
    } finally {
      setRefreshing(false);
    }
  }, [taskId, creator, userId]);

  const openCommentModal = () => {
    setCommentText("");
    setCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    if (sendingComment) return;

    setCommentText("");
    setCommentImages([]);
    setCommentModalVisible(false);
  };

  const handleRemoveCommentImage = (index: number) => {
    setCommentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePickCommentImages = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        console.log("Không có quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (result.canceled) return;

      setCommentImages((prev) => {
        const images = [...prev, ...result.assets];

        return images.slice(0, 5);
      });
    } catch (error) {
      console.log("lỗi ảnh comment:", error);
    }
  };

  const handleSendComment = async () => {
    const content = commentText.trim();

    if ((!content && commentImages.length === 0) || !task || sendingComment) {
      return;
    }

    if (!task.receiver) {
      console.log("Không có người nhận");
      return;
    }

    try {
      setSendingComment(true);

      const res = await taskServices.createTaskComment({
        content,
        task_id: task.task_id,
        receiver: task.receiver,
        images: commentImages,
      });

      if (!res.result) {
        console.log("Gửi comment thất bại:", res.message);
        return;
      }

      setCommentText("");
      setCommentImages([]);
      setCommentModalVisible(false);

      await fetchComments();
    } catch (error: any) {
      console.log("lỗi comment: ", error?.response?.data ?? error);
    } finally {
      setSendingComment(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
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
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
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
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleContainer}>
              <Text
                style={[
                  styles.taskTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
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
          title={`${t("taskDetail.comments")} (${comments.length})`}
          colors={colors}
          onAddPress={openCommentModal}
        >
          {loadingComments ? (
            <View style={styles.commentLoading}>
              <ActivityIndicator size="small" color={PRIMARY} />
            </View>
          ) : comments.length === 0 ? (
            <EmptySection
              icon="chatbubble-outline"
              text={t("taskDetail.noComments")}
              color={colors.textSecondary}
            />
          ) : (
            <View style={styles.commentList}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  colors={colors}
                  isDark={isDark}
                  onImagePress={openImagePreview}
                />
              ))}
            </View>
          )}
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
                {avatarUrl ? (
                  <Image
                    source={{
                      uri: avatarUrl,
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={23} color={PRIMARY} />
                )}
              </View>

              <View style={styles.memberInfo}>
                <Text
                  style={[
                    styles.memberName,
                    {
                      color: colors.text,
                    },
                  ]}
                >
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
                disabled={sendingComment}
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
                    source={{
                      uri: avatarUrl,
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={22} color={PRIMARY} />
                )}
              </View>

              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder={t("taskDetail.commentPlaceholder")}
                placeholderTextColor={colors.textSecondary}
                multiline
                editable={!sendingComment}
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

            <View style={styles.commentImageActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickCommentImages}
                disabled={sendingComment}
                style={[
                  styles.pickImageButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
              >
                <Ionicons name="images-outline" size={19} color={PRIMARY} />

                <Text style={styles.pickImageText}>Chọn ảnh từ thư viện</Text>
              </TouchableOpacity>

              {commentImages.length > 0 && (
                <Text
                  style={[
                    styles.imageCountText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {commentImages.length}/5
                </Text>
              )}
            </View>

            {commentImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedImages}
              >
                {commentImages.map((image, index) => (
                  <View
                    key={`${image.uri}-${index}`}
                    style={styles.selectedImageWrapper}
                  >
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.selectedImage}
                    />

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.removeSelectedImage}
                      onPress={() => handleRemoveCommentImage(index)}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.commentActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={sendingComment}
                style={[
                  styles.cancelCommentButton,
                  {
                    borderColor: colors.border,
                  },
                  sendingComment && {
                    opacity: 0.5,
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
                onPress={handleSendComment}
                disabled={
                  (!commentText.trim() && commentImages.length === 0) ||
                  sendingComment
                }
                style={[
                  styles.sendCommentButton,
                  ((!commentText.trim() && commentImages.length === 0) ||
                    sendingComment) &&
                    styles.sendCommentButtonDisabled,
                ]}
              >
                {sendingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={17} color="#FFFFFF" />

                    <Text style={styles.sendCommentText}>
                      {t("taskDetail.send")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={imagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImagePreview}
      >
        <Pressable style={styles.previewOverlay} onPress={closeImagePreview}>
          <Pressable
            style={[
              styles.previewBox,
              {
                backgroundColor: colors.surface,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.previewCloseButton}
              activeOpacity={0.8}
              onPress={closeImagePreview}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {previewImages.length > 0 && (
              <>
                <Image
                  source={{
                    uri: previewImages[previewIndex],
                  }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />

                {previewImages.length > 1 && (
                  <>
                    {previewIndex > 0 && (
                      <TouchableOpacity
                        style={[styles.previewArrow, styles.previewArrowLeft]}
                        onPress={() => setPreviewIndex((prev) => prev - 1)}
                      >
                        <Ionicons
                          name="chevron-back"
                          size={26}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    )}

                    {previewIndex < previewImages.length - 1 && (
                      <TouchableOpacity
                        style={[styles.previewArrow, styles.previewArrowRight]}
                        onPress={() => setPreviewIndex((prev) => prev + 1)}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={26}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    )}

                    <View style={styles.previewCounter}>
                      <Text style={styles.previewCounterText}>
                        {previewIndex + 1} / {previewImages.length}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function CommentItem({
  comment,
  colors,
  isDark,
  onImagePress,
}: {
  comment: TaskComment;
  colors: any;
  isDark: boolean;
  onImagePress: (images: string[], index: number) => void;
}) {
  const avatarUrl = comment.sender_avatar
    ? (getImageUrl(comment.sender_avatar) ?? undefined)
    : undefined;

  let images: string[] = [];

  try {
    const parsed = JSON.parse(comment.url_img || "[]");

    if (Array.isArray(parsed)) {
      images = parsed
        .map((item) => getImageUrl(item))
        .filter((item): item is string => !!item);
    }
  } catch (error) {
    console.log("log lỗi:", error);
  }

  return (
    <View
      style={[
        styles.commentItem,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.commentItemAvatar,
          {
            backgroundColor: isDark ? "rgba(25,118,233,0.18)" : "#E8F2FF",
          },
        ]}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.commentAvatarImage}
          />
        ) : (
          <Ionicons name="person" size={20} color={PRIMARY} />
        )}
      </View>

      <View style={styles.commentItemContent}>
        <View style={styles.commentItemHeader}>
          <Text
            style={[
              styles.commentSender,
              {
                color: colors.text,
              },
            ]}
          >
            {comment.sender_name || "--"}
          </Text>

          <Text
            style={[
              styles.commentTime,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {formatDateTime(comment.created_at)}
          </Text>
        </View>

        {!!comment.content && (
          <Text
            style={[
              styles.commentContent,
              {
                color: colors.text,
              },
            ]}
          >
            {comment.content}
          </Text>
        )}

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.commentImages}
          >
            {images.map((imageUrl, index) => (
              <TouchableOpacity
                key={`${comment.id}-${index}`}
                activeOpacity={0.8}
                onPress={() => onImagePress(images, index)}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.commentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
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

  commentLoading: {
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
  },

  commentList: {
    width: "100%",
  },

  commentItem: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  commentItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  commentAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  commentItemContent: {
    flex: 1,
    marginLeft: 10,
  },

  commentItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  commentSender: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  commentTime: {
    fontSize: 10,
  },

  commentContent: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
  },

  commentImages: {
    gap: 8,
    paddingTop: 10,
    paddingRight: 10,
  },

  commentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },

  commentImageActions: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pickImageButton: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  pickImageText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "600",
  },

  imageCountText: {
    fontSize: 11,
  },

  selectedImages: {
    gap: 10,
    paddingTop: 12,
    paddingRight: 8,
  },

  selectedImageWrapper: {
    width: 74,
    height: 74,
    position: "relative",
  },

  selectedImage: {
    width: 74,
    height: 74,
    borderRadius: 8,
  },

  removeSelectedImage: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  previewContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  previewBox: {
    width: "100%",
    maxWidth: 500,
    height: "70%",
    maxHeight: 650,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  previewCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  previewArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -22,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  previewArrowLeft: {
    left: 10,
  },

  previewArrowRight: {
    right: 10,
  },

  previewCounter: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  previewCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
