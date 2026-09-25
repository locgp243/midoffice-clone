import { StyleSheet, Text, View } from "react-native";

import AnimatedTabScreen from "@/components/common/AnimatedTabScreen";
import { Spacing } from "@/constants/Spacing";
import { FontSize, FontWeight } from "@/constants/Typography";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function HomeScreen() {
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
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Tổng quan
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            MID Office
          </Text>
        </View>
      </View>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    padding: Spacing.lg,
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  description: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
  },
});
