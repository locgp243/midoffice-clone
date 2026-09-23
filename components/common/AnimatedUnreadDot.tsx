import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export default function AnimatedUnreadDot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.55],
  });

  return (
    <Animated.View
      style={[
        styles.unreadDot,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  unreadDot: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#FF1F2D",
  },
});
