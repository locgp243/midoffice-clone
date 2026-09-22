import { StyleSheet, Text, View } from "react-native";

/**
 * NOTIFICATION SCREEN
 *
 * TODO sau này:
 * - Danh sách notification
 * - Unread count
 * - Mark as read
 * - Push notification
 */
export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông báo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F9",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
  },
});
