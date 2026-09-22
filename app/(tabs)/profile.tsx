import { StyleSheet, Text, View } from "react-native";

/**
 * PROFILE SCREEN
 *
 * TODO sau này:
 * - Avatar
 * - User information
 * - Settings
 * - Change password
 * - Logout
 */
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tôi</Text>
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
