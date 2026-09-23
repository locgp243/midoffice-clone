import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface AppToastProps {
  visible: boolean;
  type: "success" | "error";
  title?: string;
  message: string;
}

export default function AppToast({
  visible,
  type,
  title,
  message,
}: AppToastProps) {
  const translateY = useRef(new Animated.Value(-30)).current;

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(-30);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 16,
          stiffness: 180,
          useNativeDriver: true,
        }),

        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -30,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  const isSuccess = type === "success";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateY }],

          backgroundColor: isSuccess ? "#EAF8EF" : "#FDECEC",

          borderColor: isSuccess ? "#B7E4C7" : "#F5B7B1",
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isSuccess ? "#D7F3E0" : "#FADBD8",
          },
        ]}
      >
        <Ionicons
          name={isSuccess ? "checkmark-circle" : "alert-circle"}
          size={24}
          color={isSuccess ? "#2E7D32" : "#D32F2F"}
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: isSuccess ? "#1B5E20" : "#B71C1C",
            },
          ]}
        >
          {title ?? (isSuccess ? "Thành công" : "Có lỗi xảy ra")}
        </Text>

        <Text
          style={[
            styles.message,
            {
              color: isSuccess ? "#2E7D32" : "#C62828",
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 72,

    padding: 14,

    borderWidth: 1,
    borderRadius: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 10,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  message: {
    fontSize: 13,
    lineHeight: 19,
  },
});
