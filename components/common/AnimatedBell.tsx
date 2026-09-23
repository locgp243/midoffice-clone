import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function AnimatedBell({ unread }: { unread: boolean }) {
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!unread) {
      shake.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(shake, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.delay(1800),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [unread, shake]);

  const rotate = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [{ rotate }],
      }}
    >
      <Ionicons
        name="notifications"
        size={24}
        color={unread ? Colors.primary : "#999999"}
      />
    </Animated.View>
  );
}
