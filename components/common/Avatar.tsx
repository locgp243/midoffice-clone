import { useAppTheme } from "@/hooks/useAppTheme";
import { getImageUrl } from "@/utils/imageUrl";
import { Ionicons } from "@expo/vector-icons";

import { Image, StyleSheet, View } from "react-native";

interface AvatarProps {
  source?: string | null;
  size?: number;
}

export default function Avatar({ source, size = 44 }: AvatarProps) {
  const { colors } = useAppTheme();

  const imageUrl = getImageUrl(source);

  if (imageUrl) {
    return (
      <Image
        source={{
          uri: imageUrl,
        }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,

          borderRadius: size / 2,

          backgroundColor: colors.border,
        },
      ]}
    >
      <Ionicons name="person" size={size * 0.5} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});
