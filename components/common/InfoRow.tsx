import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  valueColor?: string;
}

export default function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: InfoRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.infoRow}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>

      <View style={styles.infoContent}>
        <Text
          style={[
            styles.infoLabel,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.infoValue,
            {
              color: valueColor ?? colors.text,
            },
          ]}
        >
          {value || "---"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "500",
  },
});
