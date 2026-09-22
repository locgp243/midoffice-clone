import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, View } from "react-native";

export default function Divider() {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.border,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
