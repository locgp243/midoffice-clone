import { StyleSheet, Text, View } from "react-native";

/**
 * TASK SCREEN
 *
 * TODO sau này:
 * - Danh sách nhiệm vụ
 * - Search
 * - Filter
 * - Status
 * - Task detail
 */
export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhiệm vụ</Text>
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
