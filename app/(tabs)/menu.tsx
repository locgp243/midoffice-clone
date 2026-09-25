import AnimatedTabScreen from "@/components/common/AnimatedTabScreen";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

export default function MenuScreen() {
  const { colors } = useAppTheme();

  return (
    <AnimatedTabScreen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Danh sách
        </Text>
      </View>
    </AnimatedTabScreen>
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
