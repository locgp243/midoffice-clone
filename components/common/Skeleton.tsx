import { useAppTheme } from "@/hooks/useAppTheme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type SkeletonProps = {
  count?: number;
};

export default function Skeleton({ count = 3 }: SkeletonProps) {
  const { colors } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.title, { backgroundColor: colors.border }]} />
          <View style={[styles.small, { backgroundColor: colors.border }]} />
          <View style={[styles.text, { backgroundColor: colors.border }]} />
          <View
            style={[styles.textShort, { backgroundColor: colors.border }]}
          />
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  card: {
    height: 180,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    width: "60%",
    height: 18,
    borderRadius: 5,
  },
  small: {
    width: "25%",
    height: 12,
    borderRadius: 5,
    marginTop: 12,
  },
  text: {
    width: "80%",
    height: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  textShort: {
    width: "50%",
    height: 12,
    borderRadius: 5,
    marginTop: 10,
  },
});
