import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getImageUrl } from "@/utils/imageUrl";

interface AvatarViewerProps {
  visible: boolean;
  avatar?: string | null;

  onClose: () => void;

  onConfirmImage: (uri: string) => void | Promise<void>;
}

export default function AvatarViewer({
  visible,
  avatar,
  onClose,
  onConfirmImage,
}: AvatarViewerProps) {
  const { colors } = useAppTheme();

  const [showOptions, setShowOptions] = useState(false);

  /*
   * Ảnh user vừa chọn/chụp
   * nhưng CHƯA xác nhận.
   */
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);

  /*
   * Nếu có pendingImage
   * -> preview ảnh mới.
   *
   * Nếu chưa có
   * -> hiện avatar hiện tại.
   */
  const displayImage = pendingImage ?? getImageUrl(avatar);

  /*
   * Reset state khi đóng Modal.
   */
  useEffect(() => {
    if (!visible) {
      setShowOptions(false);
      setPendingImage(null);
      setIsConfirming(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (isConfirming) {
      return;
    }

    setShowOptions(false);
    setPendingImage(null);

    onClose();
  };

  /*
   * Chọn ảnh từ thư viện
   */
  const handlePickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Quyền truy cập",
          "Bạn cần cho phép MID Office truy cập thư viện ảnh.",
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets?.[0];

      if (!image?.uri) {
        return;
      }

      /*
       * QUAN TRỌNG:
       * chưa cập nhật avatar.
       *
       * Chỉ lưu vào pendingImage
       * để user xem trước.
       */
      setPendingImage(image.uri);

      setShowOptions(false);
    } catch (error) {
      console.log("PICK IMAGE ERROR:", error);

      Alert.alert("Không thể chọn ảnh", "Đã xảy ra lỗi khi mở thư viện ảnh.");
    }
  };

  /*
   * Chụp ảnh
   */
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Quyền Camera",
          "Bạn cần cho phép MID Office sử dụng Camera.",
        );

        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const image = result.assets?.[0];

      if (!image?.uri) {
        return;
      }

      /*
       * Chỉ preview.
       */
      setPendingImage(image.uri);

      setShowOptions(false);
    } catch (error) {
      console.log("CAMERA ERROR:", error);

      Alert.alert("Không thể mở Camera", "Đã xảy ra lỗi khi mở Camera.");
    }
  };

  /*
   * User xác nhận sử dụng ảnh mới.
   */
  const handleConfirmImage = async () => {
    if (!pendingImage || isConfirming) {
      return;
    }

    try {
      setIsConfirming(true);

      /*
       * ProfileScreen sẽ xử lý:
       *
       * - cập nhật localAvatar
       * - sau này upload API
       */
      await onConfirmImage(pendingImage);

      /*
       * Reset trước khi đóng.
       */
      setPendingImage(null);
      setShowOptions(false);

      /*
       * Đóng modal.
       */
      onClose();
    } catch (error) {
      console.log("UPDATE AVATAR ERROR:", error);

      Alert.alert(
        "Không thể cập nhật",
        "Đã xảy ra lỗi khi cập nhật ảnh đại diện.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            disabled={isConfirming}
            hitSlop={12}
            style={styles.headerButton}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>
            {pendingImage ? "Xác nhận ảnh" : "Ảnh đại diện"}
          </Text>

          <View style={styles.headerButton} />
        </View>

        {/* Image Preview */}

        <View style={styles.imageContainer}>
          {displayImage ? (
            <Image
              source={{
                uri: displayImage,
              }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyAvatar}>
              <Ionicons
                name="person-circle-outline"
                size={130}
                color="#888888"
              />

              <Text style={styles.emptyText}>Chưa có ảnh đại diện</Text>
            </View>
          )}
        </View>

        {/* ======================== */}
        {/* CHƯA CHỌN ẢNH MỚI */}
        {/* ======================== */}

        {!pendingImage && !showOptions && (
          <View style={styles.bottomContainer}>
            <Pressable
              onPress={() => setShowOptions(true)}
              style={styles.changeButton}
            >
              <Ionicons name="camera-outline" size={21} color="#FFFFFF" />

              <Text style={styles.changeButtonText}>Thay đổi ảnh</Text>
            </Pressable>
          </View>
        )}

        {/* ======================== */}
        {/* ĐÃ CHỌN ẢNH → CONFIRM */}
        {/* ======================== */}

        {pendingImage && (
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmMessage}>
              Bạn có muốn sử dụng ảnh này làm ảnh đại diện?
            </Text>

            <View style={styles.confirmActions}>
              {/* Hủy ảnh vừa chọn */}

              <Pressable
                disabled={isConfirming}
                onPress={() => {
                  setPendingImage(null);
                }}
                style={[
                  styles.cancelConfirmButton,
                  {
                    opacity: isConfirming ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={styles.cancelConfirmText}>Hủy</Text>
              </Pressable>

              {/* Xác nhận */}

              <Pressable
                disabled={isConfirming}
                onPress={handleConfirmImage}
                style={[
                  styles.confirmButton,
                  {
                    opacity: isConfirming ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons name="checkmark" size={21} color="#FFFFFF" />

                <Text style={styles.confirmButtonText}>
                  {isConfirming ? "Đang cập nhật..." : "Xác nhận"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Backdrop */}

        {showOptions && (
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setShowOptions(false)}
          />
        )}

        {/* ======================== */}
        {/* CAMERA / LIBRARY */}
        {/* ======================== */}

        {showOptions && (
          <View
            style={[
              styles.optionSheet,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <Text
              style={[
                styles.optionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Thay đổi ảnh đại diện
            </Text>

            {/* Camera */}

            <Pressable style={styles.optionItem} onPress={handleTakePhoto}>
              <View style={styles.optionIcon}>
                <Ionicons name="camera-outline" size={24} color="#1976E9" />
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Chụp ảnh
                </Text>

                <Text
                  style={[
                    styles.optionDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Sử dụng Camera để chụp ảnh mới
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            {/* Library */}

            <Pressable style={styles.optionItem} onPress={handlePickImage}>
              <View style={styles.optionIcon}>
                <Ionicons name="images-outline" size={24} color="#1976E9" />
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Chọn từ thư viện
                </Text>

                <Text
                  style={[
                    styles.optionDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Chọn ảnh có sẵn trên thiết bị
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>

            {/* Cancel */}

            <Pressable
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowOptions(false)}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Hủy
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
  },

  header: {
    height: 100,
    paddingTop: 45,
    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",

    zIndex: 10,
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

    textAlign: "center",

    fontSize: 17,
    fontWeight: "600",
  },

  imageContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  emptyAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: 12,

    color: "#AAAAAA",

    fontSize: 14,
  },

  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 45,
  },

  changeButton: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    borderRadius: 14,

    backgroundColor: "#1976E9",
  },

  changeButtonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "600",
  },

  /*
   * Confirm
   */
  confirmContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 45,
  },

  confirmMessage: {
    color: "#FFFFFF",

    textAlign: "center",

    fontSize: 14,

    marginBottom: 16,
  },

  confirmActions: {
    flexDirection: "row",

    gap: 12,
  },

  cancelConfirmButton: {
    flex: 1,

    height: 52,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",

    borderRadius: 14,
  },

  cancelConfirmText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "600",
  },

  confirmButton: {
    flex: 1,

    height: 52,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 7,

    borderRadius: 14,

    backgroundColor: "#1976E9",
  },

  confirmButtonText: {
    color: "#FFFFFF",

    fontSize: 15,
    fontWeight: "600",
  },

  /*
   * Bottom Sheet
   */
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,

    backgroundColor: "rgba(0,0,0,0.45)",

    zIndex: 20,
  },

  optionSheet: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 35,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    zIndex: 30,

    elevation: 30,
  },

  handle: {
    width: 42,
    height: 4,

    alignSelf: "center",

    borderRadius: 2,

    marginBottom: 20,
  },

  optionTitle: {
    fontSize: 18,
    fontWeight: "700",

    marginBottom: 12,
  },

  optionItem: {
    minHeight: 76,

    flexDirection: "row",
    alignItems: "center",

    gap: 12,
  },

  optionIcon: {
    width: 46,
    height: 46,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 23,

    backgroundColor: "rgba(25,118,233,0.10)",
  },

  optionContent: {
    flex: 1,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "600",
  },

  optionDescription: {
    marginTop: 3,

    fontSize: 12,
  },

  divider: {
    height: StyleSheet.hairlineWidth,

    marginLeft: 58,
  },

  cancelButton: {
    height: 50,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 12,

    borderWidth: 1,

    borderRadius: 12,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
