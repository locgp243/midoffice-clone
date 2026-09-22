import { StyleSheet, Text, View } from "react-native";

/**
 * MENU SCREEN
 *
 * TODO sau này:
 * - Đặt phòng họp
 * - Nội quy
 * - Bản tin
 * - Thư viện
 * - Lịch âm
 * - ...
 */
export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách</Text>
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
