import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SubPageHeaderProps {
  title: string;
}

export default function SubPageHeader({ title }: SubPageHeaderProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: colors.header,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color={colors.headerText} />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.headerText,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.headerRight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
  },

  headerContent: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },

  headerRight: {
    width: 44,
  },
});
