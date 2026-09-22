import PasswordInput from "@/components/common/PasswordInput";
import SubPageHeader from "@/components/common/SubHeader";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { userServices } from "@/services/userServices";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChangePasswordScreen() {
  const { colors } = useAppTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    // 1. Kiểm tra mật khẩu hiện tại
    if (!oldPassword.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    // 2. Kiểm tra mật khẩu mới
    if (!newPassword.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập mật khẩu mới.");
      return;
    }

    // 3. Kiểm tra xác nhận mật khẩu
    if (!confirmPassword.trim()) {
      Alert.alert("Thông báo", "Vui lòng xác nhận mật khẩu mới.");
      return;
    }

    // 4. Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không khớp.");
      return;
    }

    // 5. Không cho mật khẩu mới giống mật khẩu cũ
    if (oldPassword === newPassword) {
      Alert.alert("Thông báo", "Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    try {
      setIsLoading(true);

      // 6. Gọi API
      const response = await userServices.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      // 7. API trả result = false
      if (!response.result) {
        Alert.alert(
          "Không thành công",
          response.message || "Không thể đổi mật khẩu.",
        );
        return;
      }

      // 8. Thành công
      Alert.alert("Thành công", response.message || "Đổi mật khẩu thành công.");

      // 9. Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log("CHANGE PASSWORD ERROR:", error);

      Alert.alert("Lỗi", "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header */}
      <SubPageHeader title="Bảo mật & Mật khẩu" />

      {/* Content */}
      <View style={styles.content}>
        {/* Security information */}
        <View
          style={[
            styles.securityCard,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={26}
              color={Colors.primary}
            />
          </View>

          <View style={styles.securityContent}>
            <Text
              style={[
                styles.securityTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Thay đổi mật khẩu
            </Text>

            <Text
              style={[
                styles.securityDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Nhập mật khẩu hiện tại và mật khẩu mới để bảo vệ tài khoản của
              bạn.
            </Text>
          </View>
        </View>

        {/* Mật khẩu hiện tại */}
        <PasswordInput
          label="Mật khẩu hiện tại"
          placeholder="Nhập mật khẩu hiện tại"
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        {/* Mật khẩu mới */}
        <PasswordInput
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {/* Xác nhận mật khẩu */}
        <PasswordInput
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Button đổi mật khẩu */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
          disabled={isLoading}
          onPress={handleChangePassword}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="key-outline" size={20} color="#FFFFFF" />

              <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  // Security card
  securityCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },

  securityIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 118, 233, 0.1)",
  },

  securityContent: {
    flex: 1,
    marginLeft: 12,
  },

  securityTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  securityDescription: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Submit button
  submitButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
